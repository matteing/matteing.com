import { getRedis } from "@/lib/redis";
import { normalizeTrack } from "./normalize";
import { getPlaybackPosition } from "./playback.mjs";
import { HEARTBEAT_TTL_MS } from "./shared.mjs";
import type { NowPlayingState, Track } from "./types";

const KEY = "music:playback:v2";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface StoredPlayback {
	sessionId: string;
	sequence: number;
	observationId: string | null;
	track: Track | null;
	estimatedStartedAt: number | null;
	expiresAt: number;
}

export class MusicSyncError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export function parseSessionId(body: unknown): string {
	const sessionId = (body as { sessionId?: unknown } | null)?.sessionId;
	if (typeof sessionId !== "string" || !UUID.test(sessionId)) {
		throw new MusicSyncError("Invalid sessionId", 400);
	}
	return sessionId;
}

export function parsePlaybackUpdate(
	body: unknown,
	now = Date.now(),
): StoredPlayback {
	const sessionId = parseSessionId(body);
	const input = body as Record<string, unknown>;
	if (
		!Number.isSafeInteger(input.sequence) ||
		(input.sequence as number) <= 0
	) {
		throw new MusicSyncError("Invalid sequence", 400);
	}
	if (
		!Number.isSafeInteger(input.elapsedMs) ||
		(input.elapsedMs as number) < 0 ||
		(input.elapsedMs as number) > 86_400_000
	) {
		throw new MusicSyncError("Invalid elapsedMs", 400);
	}
	const track = input.track === null ? null : normalizeTrack(input.track);
	if (input.track !== null && !track)
		throw new MusicSyncError("Invalid track", 400);
	if (
		track
			? typeof input.observationId !== "string" ||
				!UUID.test(input.observationId)
			: input.observationId !== null || input.elapsedMs !== 0
	) {
		throw new MusicSyncError("Invalid observation", 400);
	}
	return {
		sessionId,
		sequence: input.sequence as number,
		observationId: input.observationId as string | null,
		track,
		estimatedStartedAt: track ? now - (input.elapsedMs as number) : null,
		expiresAt: now + HEARTBEAT_TTL_MS,
	};
}

// A single live writer and increasing sequence prevent late requests or a second
// CLI from replacing fresher state. Repeated heartbeats never restart a song.
const UPDATE = `
if redis.call('EXISTS', KEYS[2]) == 1 then return -4 end
local incoming = cjson.decode(ARGV[1])
local previous = redis.call('GET', KEYS[1])
if previous then
  local old = cjson.decode(previous)
  if old.sessionId ~= incoming.sessionId then return -1 end
  if old.sequence >= incoming.sequence then return -2 end
  if old.observationId ~= cjson.null and old.observationId == incoming.observationId then
    if old.track.id ~= incoming.track.id then return -3 end
    incoming.estimatedStartedAt = math.min(old.estimatedStartedAt, incoming.estimatedStartedAt)
  end
end
redis.call('SET', KEYS[1], cjson.encode(incoming), 'PX', ARGV[2])
return 1
`;

export async function publishPlayback(body: unknown) {
	const update = parsePlaybackUpdate(body);
	const redis = getRedis();
	if (!redis)
		throw new MusicSyncError("Playback storage is not configured", 503);
	const result = Number(
		await redis.eval(
			UPDATE,
			2,
			KEY,
			`${KEY}:stopped:${update.sessionId}`,
			JSON.stringify(update),
			HEARTBEAT_TTL_MS,
		),
	);
	if (result === -1)
		throw new MusicSyncError(
			"Another music sync process is active; stop it or wait 45 seconds",
			409,
		);
	if (result === -2) throw new MusicSyncError("Out-of-order update", 409);
	if (result === -4)
		throw new MusicSyncError(
			"This music sync session has stopped; restart the CLI",
			409,
		);
	if (result !== 1)
		throw new MusicSyncError("Observation does not match track", 400);
}

export async function clearPlayback(body: unknown) {
	const sessionId = parseSessionId(body);
	const redis = getRedis();
	if (!redis)
		throw new MusicSyncError("Playback storage is not configured", 503);
	await redis.eval(
		`
    redis.call('SET', KEYS[2], '1', 'PX', 300000)
    local previous = redis.call('GET', KEYS[1])
    if previous and cjson.decode(previous).sessionId == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    end
    return 0
  `,
		2,
		KEY,
		`${KEY}:stopped:${sessionId}`,
		sessionId,
	);
}

export async function getNowPlayingState(): Promise<NowPlayingState> {
	const redis = getRedis();
	const raw = redis ? await redis.get(KEY) : null;
	const serverTime = Date.now();
	const empty: NowPlayingState = {
		track: null,
		isPlaying: false,
		estimatedStartedAt: null,
		expiresAt: null,
		serverTime,
	};
	if (!raw) return empty;
	const stored = JSON.parse(raw) as StoredPlayback;
	const state: NowPlayingState = {
		track: stored.track,
		isPlaying: !!stored.track,
		estimatedStartedAt: stored.estimatedStartedAt,
		expiresAt: stored.expiresAt,
		serverTime,
	};
	return getPlaybackPosition(state).isPlaying ? state : empty;
}
