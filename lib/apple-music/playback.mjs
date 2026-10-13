import { HEARTBEAT_TTL_MS } from "./shared.mjs";

/**
 * Estimate only while both the observation and the CLI heartbeat are fresh.
 * Use server time plus locally measured elapsed time, never the browser clock.
 * @param {{track: {durationMs: number}|null, isPlaying: boolean, estimatedStartedAt: number|null, expiresAt: number|null, serverTime: number}} state
 * @param {number} elapsedSinceResponseMs
 */
export function getPlaybackPosition(state, elapsedSinceResponseMs = 0) {
	const idle = { isPlaying: false, currentTime: 0, progressPercent: 0 };
	if (
		!state.track ||
		!state.isPlaying ||
		state.estimatedStartedAt === null ||
		state.expiresAt === null
	)
		return idle;
	const now = state.serverTime + Math.max(0, elapsedSinceResponseMs);
	const elapsed = Math.max(0, now - state.estimatedStartedAt);
	const duration = state.track.durationMs;
	const limit = duration > 0 ? duration : HEARTBEAT_TTL_MS;
	if (
		!Number.isFinite(now) ||
		!Number.isFinite(elapsed) ||
		now >= state.expiresAt ||
		elapsed >= limit
	)
		return idle;
	return {
		isPlaying: true,
		currentTime: duration > 0 ? Math.min(elapsed, duration) : 0,
		progressPercent:
			duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0,
	};
}
