import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import {
	HEARTBEAT_TTL_MS,
	MIN_SECRET_LENGTH,
	parseHistory,
	POLL_INTERVAL_MS,
	RECENT_TRACKS_URL,
	REQUEST_TIMEOUT_MS,
} from "../lib/apple-music/shared.mjs";
import {
	createSyncClock,
	createSyncState,
	getObservation,
	observeHistory,
	resetAfterOutage,
	retryDelayMs,
} from "./music-sync-state.mjs";

const HELP = `Keep the blog's estimated Apple Music playback state current.

Usage: npm run music:sync -- [--dry-run] [--help]

Environment (.env.local is loaded by the npm script):
  AM_DEV_TOKEN       Apple Music developer token
  AM_USER_TOKEN      Apple Music user token for your account
  MUSIC_SYNC_URL     Full blog endpoint, e.g. https://matteing.com/api/now-playing
  MUSIC_SYNC_SECRET  Shared secret configured on the blog (${MIN_SECRET_LENGTH}+ characters)

--dry-run reads Apple history and logs changes without publishing to the blog.
Only AM_DEV_TOKEN and AM_USER_TOKEN are required in dry-run mode.

Polls every ${POLL_INTERVAL_MS / 1000} seconds. Startup establishes a baseline; only a changed first
history track starts an estimated timer. History cannot detect pauses, seeking,
or consecutive repeats. Stop with Ctrl+C. If the process disappears, the blog
expires its heartbeat after ${HEARTBEAT_TTL_MS / 1000} seconds.
`;

class SyncError extends Error {
	constructor(message, { fatal = false } = {}) {
		super(message);
		this.name = "SyncError";
		this.fatal = fatal;
	}
}

function requiredEnv(env, name) {
	const value = env[name]?.trim();
	if (!value) {
		throw new SyncError(`Set ${name} in .env.local or your environment.`, {
			fatal: true,
		});
	}
	if (/[\r\n]/.test(value)) {
		throw new SyncError(`${name} must be a single-line value.`, {
			fatal: true,
		});
	}
	return value;
}

export function readConfig(env, args = []) {
	for (const arg of args) {
		if (!["--dry-run", "--help", "-h"].includes(arg)) {
			throw new SyncError("Unknown option. Use --help for usage.", {
				fatal: true,
			});
		}
	}

	if (args.includes("--help") || args.includes("-h")) {
		return { help: true };
	}

	const dryRun = args.includes("--dry-run");
	const developerToken = requiredEnv(env, "AM_DEV_TOKEN");
	const userToken = requiredEnv(env, "AM_USER_TOKEN");
	if (dryRun) return { dryRun, developerToken, userToken };

	const syncSecret = requiredEnv(env, "MUSIC_SYNC_SECRET");
	if (syncSecret.length < MIN_SECRET_LENGTH) {
		throw new SyncError(
			`MUSIC_SYNC_SECRET must contain at least ${MIN_SECRET_LENGTH} characters.`,
			{
				fatal: true,
			},
		);
	}
	let syncUrl;
	try {
		syncUrl = new URL(requiredEnv(env, "MUSIC_SYNC_URL"));
	} catch (error) {
		if (error instanceof SyncError) throw error;
		throw new SyncError(
			"MUSIC_SYNC_URL must be a valid full endpoint URL.",
			{
				fatal: true,
			},
		);
	}
	const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(
		syncUrl.hostname,
	);
	if (
		(syncUrl.protocol !== "https:" &&
			!(syncUrl.protocol === "http:" && isLocalhost)) ||
		syncUrl.username ||
		syncUrl.password ||
		syncUrl.hash
	) {
		throw new SyncError(
			"MUSIC_SYNC_URL must use HTTPS (HTTP is allowed on localhost) and have no embedded credentials or fragment.",
			{ fatal: true },
		);
	}

	return {
		dryRun,
		developerToken,
		userToken,
		syncUrl: syncUrl.href,
		syncSecret,
	};
}

async function fetchChecked(fetchImpl, url, options, service, signal) {
	let response;
	try {
		response = await fetchImpl(url, {
			...options,
			// Never forward either credential to a redirected destination.
			redirect: "error",
			signal: AbortSignal.any([
				...(signal ? [signal] : []),
				AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			]),
		});
	} catch {
		if (signal?.aborted) throw signal.reason;
		throw new SyncError(
			`${service} request failed or timed out. Check your connection and endpoint configuration.`,
		);
	}

	if (service === "Blog" || !response.ok) {
		// The publisher only needs the status. Release each body so the long-running
		// process does not accumulate unread HTTP streams.
		await response.body?.cancel().catch(() => {});
	}

	if (response.status === 401 || response.status === 403) {
		throw new SyncError(
			service === "Apple Music"
				? "Apple Music rejected your credentials. Refresh AM_DEV_TOKEN and/or AM_USER_TOKEN, then restart music:sync."
				: "The blog rejected MUSIC_SYNC_SECRET. Check that it matches the deployed configuration.",
			{ fatal: true },
		);
	}
	if (service === "Blog" && response.status === 409) {
		throw new SyncError(
			`Another music:sync session is active. Stop that process or wait at least ${HEARTBEAT_TTL_MS / 1000} seconds after it stops, then restart.`,
			{ fatal: true },
		);
	}
	if (!response.ok) {
		throw new SyncError(
			`${service} returned HTTP ${response.status}. ${
				response.status === 429
					? "Rate limited; retrying with a bounded delay."
					: "Check credentials and endpoint configuration if this persists."
			}`,
			{
				fatal:
					response.status >= 400 &&
					response.status < 500 &&
					response.status !== 429,
			},
		);
	}
	return response;
}

async function fetchHistory(config, fetchImpl, signal) {
	const response = await fetchChecked(
		fetchImpl,
		RECENT_TRACKS_URL,
		{
			headers: {
				Authorization: `Bearer ${config.developerToken}`,
				"Music-User-Token": config.userToken,
			},
			cache: "no-store",
		},
		"Apple Music",
		signal,
	);
	let payload;
	try {
		payload = await response.json();
	} catch {
		if (signal?.aborted) throw signal.reason;
		throw new SyncError("Apple Music returned unreadable history data.");
	}
	try {
		return parseHistory(payload);
	} catch {
		throw new SyncError(
			"Apple Music returned invalid history data. No heartbeat was sent.",
		);
	}
}

function singleLine(value) {
	return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").slice(0, 200);
}

export async function runSync(
	config,
	{
		signal,
		fetchImpl = fetch,
		now: monotonicNow = () => performance.now(),
		wallNow = Date.now,
		sleep = (ms, stopSignal) =>
			delay(ms, undefined, { signal: stopSignal }),
		log = console.log,
		logError = console.error,
	} = {},
) {
	const now = createSyncClock(monotonicNow, wallNow);
	const state = createSyncState();
	const sessionId = randomUUID();
	let sequence = 0;
	let failureCount = 0;
	let lastError = null;
	let lastLoggedObservationId;
	let attemptedPublish = false;

	log(
		`Music sync started${config.dryRun ? " (dry run)" : ""}. Polling account history every ${POLL_INTERVAL_MS / 1000} seconds; progress is estimated.`,
	);
	try {
		while (!signal?.aborted) {
			const pollStartedAt = now();
			let nextDelay = POLL_INTERVAL_MS;
			try {
				if (resetAfterOutage(state, pollStartedAt)) {
					log(
						`The connection gap exceeded ${HEARTBEAT_TTL_MS / 1000} seconds. Waiting for a fresh history baseline.`,
					);
				}
				const tracks = await fetchHistory(config, fetchImpl, signal);
				// A slow fetch can itself cross the expiry boundary.
				resetAfterOutage(state, now());
				const change = observeHistory(state, tracks, now());
				const observation = getObservation(state, now());

				if (!config.dryRun) {
					attemptedPublish = true;
					await fetchChecked(
						fetchImpl,
						config.syncUrl,
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${config.syncSecret}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								sessionId,
								sequence: ++sequence,
								...observation,
							}),
						},
						"Blog",
						signal,
					);
				}

				// Anchor freshness before the request: a laptop can sleep while a
				// response is pending, and a late acknowledgement must not hide that gap.
				state.lastHealthyPollAtMs = pollStartedAt;
				if (failureCount > 0)
					log("Connection recovered; fresh history synchronized.");
				failureCount = 0;
				lastError = null;
				if (change === "baseline") {
					log(
						"History baseline established. Waiting for the first track to change.",
					);
				}
				if (lastLoggedObservationId !== observation.observationId) {
					if (observation.track) {
						log(
							`Estimated playback: ${singleLine(observation.track.attributes.artistName)} — ${singleLine(observation.track.attributes.name)}`,
						);
					} else if (lastLoggedObservationId) {
						log(
							"Estimated playback ended. Keeping recently played available.",
						);
					}
					lastLoggedObservationId = observation.observationId;
				}
			} catch (error) {
				if (signal?.aborted) break;
				const safeError =
					error instanceof SyncError
						? error
						: new SyncError(
								"Music sync failed unexpectedly. Check your configuration and restart.",
								{
									fatal: true,
								},
							);
				if (safeError.fatal) throw safeError;
				failureCount += 1;
				nextDelay = retryDelayMs(failureCount);
				if (safeError.message !== lastError) {
					logError(safeError.message);
					lastError = safeError.message;
				}
			}

			try {
				await sleep(
					Math.max(0, nextDelay - (now() - pollStartedAt)),
					signal,
				);
			} catch (error) {
				if (!signal?.aborted) throw error;
			}
		}
	} finally {
		if (!config.dryRun && attemptedPublish) {
			try {
				// Cleanup gets its own short timeout after the polling signal is aborted.
				const response = await fetchImpl(config.syncUrl, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${config.syncSecret}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ sessionId }),
					redirect: "error",
					signal: AbortSignal.timeout(3_000),
				});
				await response.body?.cancel().catch(() => {});
				if (!response.ok) throw new Error("Heartbeat cleanup failed.");
			} catch {
				// The server's heartbeat expiry also covers crashes and offline exits.
				logError(
					`Could not clear the blog heartbeat. It will expire within ${HEARTBEAT_TTL_MS / 1000} seconds.`,
				);
			}
		}
		log("Music sync stopped.");
	}
}

async function main() {
	const controller = new AbortController();
	const stop = () => controller.abort();
	process.once("SIGINT", stop);
	process.once("SIGTERM", stop);
	try {
		const config = readConfig(process.env, process.argv.slice(2));
		if (config.help) {
			console.log(HELP);
			return;
		}
		await runSync(config, { signal: controller.signal });
	} catch (error) {
		console.error(
			error instanceof SyncError
				? error.message
				: "Music sync failed unexpectedly. Check your configuration and restart.",
		);
		process.exitCode = 1;
	} finally {
		process.removeListener("SIGINT", stop);
		process.removeListener("SIGTERM", stop);
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	await main();
}
