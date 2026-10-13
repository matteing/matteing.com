import assert from "node:assert/strict";
import test from "node:test";
import { parseHistory, RECENT_TRACKS_URL } from "../lib/apple-music/shared.mjs";
import {
	createSyncClock,
	createSyncState,
	getObservation,
	observeHistory,
	resetAfterOutage,
	retryDelayMs,
} from "./music-sync-state.mjs";
import { readConfig, runSync } from "./music-sync.mjs";

const song = (id, durationInMillis = 180_000) => ({
	id,
	type: "songs",
	attributes: { name: `Song ${id}`, artistName: "Artist", durationInMillis },
});
const emptyObservation = { observationId: null, track: null, elapsedMs: 0 };
const env = {
	AM_DEV_TOKEN: "developer-token",
	AM_USER_TOKEN: "user-token",
	MUSIC_SYNC_SECRET: "test-secret-".repeat(4),
	MUSIC_SYNC_URL: "https://example.com/api/now-playing",
};

test("startup establishes a baseline and does not revive the latest history track", () => {
	const state = createSyncState();
	assert.equal(observeHistory(state, [song("a")], 100), "baseline");
	assert.deepEqual(getObservation(state, 100), emptyObservation);
	observeHistory(state, [song("a")], 15_100);
	assert.deepEqual(getObservation(state, 15_100), emptyObservation);
});

test("a changed first track starts an estimate without resets on repeated polls", () => {
	const state = createSyncState();
	observeHistory(state, [song("a")], 100);
	observeHistory(state, [song("b")], 15_100, () => "observation-b");
	observeHistory(state, [song("b"), song("a")], 30_100);
	assert.deepEqual(getObservation(state, 30_100), {
		observationId: "observation-b",
		track: song("b"),
		elapsedMs: 15_000,
	});
});

test("changes below the first track do not infer a fresh play", () => {
	const state = createSyncState();
	observeHistory(state, [song("a"), song("b")], 100);
	observeHistory(state, [song("a"), song("c")], 15_100);
	assert.deepEqual(getObservation(state, 15_100), emptyObservation);
});

test("estimates stop exactly at duration and do not restart for the same song", () => {
	const state = createSyncState();
	observeHistory(state, [song("a")], 0);
	observeHistory(state, [song("b", 30_000)], 15_000);
	assert.equal(getObservation(state, 44_999).elapsedMs, 29_999);
	assert.deepEqual(getObservation(state, 45_000), emptyObservation);
	observeHistory(state, [song("b", 30_000)], 60_000);
	assert.deepEqual(getObservation(state, 60_000), emptyObservation);
});

test("unknown or invalid duration expires after 45 seconds", () => {
	for (const duration of [null, 0, -1, NaN, Infinity, "10000"]) {
		const state = createSyncState();
		observeHistory(state, [song("a")], 0);
		observeHistory(state, [song("b", duration)], 15_000);
		assert.ok(getObservation(state, 59_999).track);
		assert.deepEqual(getObservation(state, 60_000), emptyObservation);
	}
});

test("empty history is valid, clears playback, and can establish the initial baseline", () => {
	const state = createSyncState();
	assert.deepEqual(parseHistory({ data: [] }), []);
	observeHistory(state, [], 0);
	observeHistory(state, [song("b")], 15_000);
	assert.ok(getObservation(state, 15_000).track);
	observeHistory(state, [], 30_000);
	assert.deepEqual(getObservation(state, 30_000), emptyObservation);
});

test("45-second outages rebaseline instead of replaying changes from the gap", () => {
	const state = createSyncState();
	observeHistory(state, [song("a")], 0);
	state.lastHealthyPollAtMs = 0;
	observeHistory(state, [song("b")], 15_000);
	assert.equal(resetAfterOutage(state, 44_999), false);
	assert.equal(resetAfterOutage(state, 45_000), true);
	assert.equal(observeHistory(state, [song("c")], 45_000), "baseline");
	assert.deepEqual(getObservation(state, 45_000), emptyObservation);
});

test("a startup publication outage also expires the unacknowledged baseline", () => {
	const state = createSyncState();
	observeHistory(state, [song("a")], 0);
	assert.equal(resetAfterOutage(state, 45_000), true);
	observeHistory(state, [song("b")], 45_000);
	assert.deepEqual(getObservation(state, 45_000), emptyObservation);
});

test("valid library songs can omit album metadata, artwork, URL, and duration", () => {
	const track = {
		id: "i.library",
		type: "library-songs",
		attributes: { name: "Local song", artistName: "Artist" },
	};
	assert.deepEqual(parseHistory({ data: [track] }), [track]);
});

test("malformed history is rejected without silently inventing an empty baseline", () => {
	for (const payload of [
		null,
		{},
		{ data: null },
		{ data: [null] },
		{ data: [{ ...song("a"), type: "albums" }] },
		{ data: [{ ...song("a"), id: "" }] },
		{ data: [{ ...song("a"), attributes: {} }] },
	]) {
		assert.throws(() => parseHistory(payload), /invalid history/);
	}
});

test("retry delays are bounded", () => {
	assert.deepEqual(
		[1, 2, 3, 4, 100].map(retryDelayMs),
		[5_000, 10_000, 20_000, 30_000, 30_000],
	);
});

test("help needs no credentials and dry run only needs Apple credentials", () => {
	assert.deepEqual(readConfig({}, ["--help"]), { help: true });
	assert.equal(
		readConfig({ AM_DEV_TOKEN: "dev", AM_USER_TOKEN: "user" }, [
			"--dry-run",
		]).dryRun,
		true,
	);
	assert.throws(() => readConfig({}, []), /AM_DEV_TOKEN/);
	assert.throws(() => readConfig(env, ["--unknown"]), /Unknown option/);
});

test("publishing requires a strong secret and a safe explicit endpoint", () => {
	assert.throws(
		() => readConfig({ ...env, MUSIC_SYNC_SECRET: "short" }),
		/at least 32/,
	);
	assert.throws(
		() => readConfig({ ...env, MUSIC_SYNC_URL: "" }),
		/Set MUSIC_SYNC_URL/,
	);
	for (const syncUrl of [
		"http://example.com/api/now-playing",
		"https://user:password@example.com/api/now-playing",
		"https://example.com/api/now-playing#fragment",
		"http://localhost.example.com/api/now-playing",
		"not a url",
	]) {
		assert.throws(
			() => readConfig({ ...env, MUSIC_SYNC_URL: syncUrl }),
			/MUSIC_SYNC_URL/,
		);
	}
	for (const syncUrl of [
		env.MUSIC_SYNC_URL,
		"http://localhost:3000/api/now-playing",
		"http://127.0.0.1:3000/api/now-playing",
		"http://[::1]:3000/api/now-playing",
	]) {
		assert.equal(
			readConfig({ ...env, MUSIC_SYNC_URL: syncUrl }).syncUrl,
			syncUrl,
		);
	}
});

async function runScenario(historyResponses, options = {}) {
	const controller = new AbortController();
	const calls = [];
	const errors = [];
	const logs = [];
	let clock = 0;
	let wallClock = 0;
	let pollCount = 0;
	let postCount = 0;
	let sleepCount = 0;
	const config = readConfig(env, options.dryRun ? ["--dry-run"] : []);
	const fetchImpl = async (url, init) => {
		calls.push({ url, ...init });
		assert.equal(init.redirect, "error");
		if (url === RECENT_TRACKS_URL) {
			const reply = historyResponses[pollCount++];
			if (reply instanceof Error) throw reply;
			if (reply instanceof Response) return reply;
			return Response.json(reply);
		}
		if (init.method === "POST") {
			wallClock += options.postWallAdvances?.[postCount++] ?? 0;
			if (options.postResponse) return options.postResponse();
		}
		return new Response(null, { status: 204 });
	};
	await runSync(config, {
		signal: controller.signal,
		fetchImpl,
		now: () => clock,
		wallNow: () => wallClock,
		sleep: async (ms) => {
			const sleepIndex = sleepCount++;
			const monotonicDelta = options.sleepDelays?.[sleepIndex] ?? ms;
			clock += monotonicDelta;
			wallClock +=
				options.wallSleepDelays?.[sleepIndex] ?? monotonicDelta;
			if (pollCount >= historyResponses.length) controller.abort();
		},
		log: (message) => logs.push(message),
		logError: (message) => errors.push(message),
	});
	return { calls, errors, logs };
}

test("runner sends coherent heartbeats and clears its own session on shutdown", async () => {
	const { calls } = await runScenario([
		{ data: [song("a")] },
		{ data: [song("b")] },
		{ data: [song("b")] },
	]);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts.length, 3);
	assert.equal(posts[0].track, null);
	assert.equal(posts[1].track.id, "b");
	assert.equal(posts[1].elapsedMs, 0);
	assert.equal(posts[2].elapsedMs, 15_000);
	assert.equal(posts[1].observationId, posts[2].observationId);
	assert.deepEqual(
		posts.map((post) => post.sequence),
		[1, 2, 3],
	);
	assert.ok(posts.every((post) => post.sessionId === posts[0].sessionId));
	const cleanup = calls.find((call) => call.method === "DELETE");
	assert.deepEqual(JSON.parse(cleanup.body), {
		sessionId: posts[0].sessionId,
	});
});

test("failed Apple polls send no heartbeat and recovery reads fresh history", async () => {
	const { calls, errors, logs } = await runScenario([
		{ data: [song("a")] },
		new Error("secret-containing transport error"),
		{ data: [song("c")] },
	]);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts.length, 2);
	assert.equal(posts[1].track.id, "c");
	assert.equal(errors.length, 1);
	assert.doesNotMatch(errors[0], /secret-containing/);
	assert.ok(logs.some((message) => message.includes("Connection recovered")));
});

test("outage recovery publishes a fresh baseline instead of a stale track", async () => {
	const { calls } = await runScenario(
		[{ data: [song("a")] }, new Error("offline"), { data: [song("c")] }],
		{ sleepDelays: [15_000, 35_000] },
	);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts.length, 2);
	assert.equal(posts[1].track, null);
});

test("waking from sleep rebaselines even if the monotonic clock did not advance", async () => {
	const { calls } = await runScenario(
		[{ data: [song("a")] }, { data: [song("b")] }, { data: [song("b")] }],
		{ sleepDelays: [15_000, 0], wallSleepDelays: [15_000, 120_000] },
	);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts[1].track.id, "b");
	assert.deepEqual(
		{
			observationId: posts[2].observationId,
			track: posts[2].track,
			elapsedMs: posts[2].elapsedMs,
		},
		emptyObservation,
	);
});

test("backward wall-clock corrections never rewind estimated progress", () => {
	let monotonic = 0;
	let wall = 100_000;
	const now = createSyncClock(
		() => monotonic,
		() => wall,
	);
	assert.equal(now(), 0);
	monotonic += 15_000;
	wall -= 60_000;
	assert.equal(now(), 15_000);
	monotonic += 15_000;
	wall += 15_000;
	assert.equal(now(), 30_000);
});

test("sleep during a pending publication cannot make the old observation fresh", async () => {
	const { calls } = await runScenario(
		[{ data: [song("a")] }, { data: [song("b")] }, { data: [song("b")] }],
		{ postWallAdvances: [0, 120_000] },
	);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts[1].track.id, "b");
	assert.equal(posts[2].track, null);
});

test("malformed or empty Apple responses cannot perpetuate an old estimate", async () => {
	const { calls } = await runScenario([
		{ data: [song("a")] },
		{ data: [song("b")] },
		{ errors: [] },
		{ data: [] },
	]);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.equal(posts.length, 3);
	assert.equal(posts[1].track.id, "b");
	assert.equal(posts[2].track, null);
});

test("dry run never writes to the blog", async () => {
	const { calls } = await runScenario(
		[{ data: [song("a")] }, { data: [song("b")] }],
		{
			dryRun: true,
		},
	);
	assert.ok(calls.every((call) => call.url === RECENT_TRACKS_URL));
});

test("expired Apple credentials terminate with an actionable error", async () => {
	await assert.rejects(
		runScenario([new Response(null, { status: 401 })]),
		/Refresh AM_DEV_TOKEN and\/or AM_USER_TOKEN/,
	);
});

test("blog authentication and competing sessions terminate clearly", async () => {
	for (const [status, expected] of [
		[403, /MUSIC_SYNC_SECRET/],
		[409, /Another music:sync session/],
	]) {
		await assert.rejects(
			runScenario([{ data: [song("a")] }], {
				postResponse: () => new Response(null, { status }),
			}),
			expected,
		);
	}
});

test("blog publication failures refresh Apple data rather than retrying an old payload", async () => {
	let attempts = 0;
	const { calls } = await runScenario(
		[{ data: [song("a")] }, { data: [song("b")] }, { data: [song("c")] }],
		{
			postResponse: () =>
				new Response(null, { status: ++attempts === 2 ? 503 : 204 }),
		},
	);
	const posts = calls
		.filter((call) => call.method === "POST")
		.map((call) => JSON.parse(call.body));
	assert.deepEqual(
		posts.map((post) => post.track?.id ?? null),
		[null, "b", "c"],
	);
	assert.equal(posts[2].elapsedMs, 0);
	assert.notEqual(posts[1].observationId, posts[2].observationId);
});
