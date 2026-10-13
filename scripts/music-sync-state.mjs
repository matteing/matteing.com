import { randomUUID } from "node:crypto";
import {
	HEARTBEAT_TTL_MS,
	trackDurationMs,
} from "../lib/apple-music/shared.mjs";

export function createSyncClock(monotonicNow, wallNow) {
	let previousMonotonic = monotonicNow();
	let previousWall = wallNow();
	let elapsedMs = 0;
	return () => {
		const monotonic = monotonicNow();
		const wall = wallNow();
		// Some platforms pause the monotonic clock during system sleep. Count
		// whichever clock advanced farther; clock corrections cannot rewind an
		// estimate, and a large forward correction safely forces a new baseline.
		elapsedMs += Math.max(
			monotonic - previousMonotonic,
			wall - previousWall,
			0,
		);
		previousMonotonic = monotonic;
		previousWall = wall;
		return elapsedMs;
	};
}

export function createSyncState() {
	return {
		hasBaseline: false,
		headId: null,
		observationId: null,
		track: null,
		detectedAtMs: null,
		baselineAtMs: null,
		lastHealthyPollAtMs: null,
	};
}

export function resetAfterOutage(state, nowMs) {
	const lastHealthyAt = state.lastHealthyPollAtMs ?? state.baselineAtMs;
	if (lastHealthyAt !== null && nowMs - lastHealthyAt >= HEARTBEAT_TTL_MS) {
		Object.assign(state, createSyncState());
		return true;
	}
	return false;
}

function clearObservation(state) {
	state.observationId = null;
	state.track = null;
	state.detectedAtMs = null;
}

// Recent history has no player position, pause, or seek information. Only a
// changed first track is evidence for starting a new, explicitly estimated timer.
export function observeHistory(state, tracks, nowMs, newId = randomUUID) {
	const head = tracks[0] ?? null;
	const headId = head ? `${head.type}:${head.id}` : null;

	if (!state.hasBaseline) {
		state.hasBaseline = true;
		state.headId = headId;
		state.baselineAtMs = nowMs;
		clearObservation(state);
		return "baseline";
	}

	if (headId === state.headId) {
		return "unchanged";
	}

	state.headId = headId;
	if (!head) {
		clearObservation(state);
		return "empty";
	}

	state.observationId = newId();
	state.track = head;
	state.detectedAtMs = nowMs;
	return "track";
}

export function getObservation(state, nowMs) {
	if (!state.track || state.detectedAtMs === null) {
		return { observationId: null, track: null, elapsedMs: 0 };
	}

	const elapsedMs = Math.max(0, Math.floor(nowMs - state.detectedAtMs));
	const expiresAfterMs =
		trackDurationMs(state.track.attributes.durationInMillis) ||
		HEARTBEAT_TTL_MS;

	if (elapsedMs >= expiresAfterMs) {
		clearObservation(state);
		return { observationId: null, track: null, elapsedMs: 0 };
	}

	return {
		observationId: state.observationId,
		track: state.track,
		elapsedMs,
	};
}

export function retryDelayMs(failureCount) {
	return Math.min(5_000 * 2 ** Math.min(failureCount - 1, 3), 30_000);
}
