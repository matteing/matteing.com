// Shared by the plain Node CLI, Next route handlers, and the playback UI.
export const RECENT_TRACKS_URL =
	"https://api.music.apple.com/v1/me/recent/played/tracks?limit=30&types=songs,library-songs&include[songs]=albums&include[library-songs]=albums";
export const REQUEST_TIMEOUT_MS = 10_000;
export const POLL_INTERVAL_MS = 15_000;
export const HEARTBEAT_TTL_MS = 45_000;
export const RECENT_FRESH_MS = 30_000;
export const RECENT_MAX_AGE_MS = 300_000;
export const MIN_SECRET_LENGTH = 32;

/** @typedef {Record<string, unknown> & {id: string, type: "songs" | "library-songs", attributes: Record<string, unknown> & {name: string, artistName: string}}} HistoryTrack */

const isRecord = (value) =>
	value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = (value) => typeof value === "string" && !!value.trim();

/** @param {unknown} value @returns {value is HistoryTrack} */
export function isAppleMusicTrack(value) {
	return (
		isRecord(value) &&
		hasText(value.id) &&
		["songs", "library-songs"].includes(value.type) &&
		isRecord(value.attributes) &&
		hasText(value.attributes.name) &&
		hasText(value.attributes.artistName)
	);
}

/** @param {unknown} payload @returns {HistoryTrack[]} */
export function parseHistory(payload) {
	if (!isRecord(payload) || !Array.isArray(payload.data)) {
		throw new Error("Apple Music returned an invalid history response.");
	}
	if (!payload.data.every(isAppleMusicTrack)) {
		throw new Error("Apple Music returned an invalid history track.");
	}
	return payload.data;
}

/** @param {unknown} value */
export function trackDurationMs(value) {
	return typeof value === "number" &&
		Number.isFinite(value) &&
		value > 0 &&
		value <= Number.MAX_SAFE_INTEGER
		? Math.round(value)
		: 0;
}
