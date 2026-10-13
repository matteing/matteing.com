import { unstable_cache } from "next/cache";
import { getRecentTracks } from "./api";
import { normalizeRecentTracks, recentAlbumsFromTracks } from "./normalize";
import { RECENT_FRESH_MS, RECENT_MAX_AGE_MS } from "./shared.mjs";
import type { Album, RecentlyPlayedState } from "./types";

interface Snapshot {
	albums: Album[];
	fetchedAt: number;
}

// Cache only complete, validated snapshots. Next retains the last successful
// value during background revalidation failures; its original timestamp stays intact.
const readSnapshot = unstable_cache(
	async (): Promise<Snapshot> => {
		const response = await getRecentTracks();
		if (!response.ok) {
			throw new Error(
				`Apple Music recent tracks returned ${response.status}`,
			);
		}
		const body: unknown = await response.json();
		const data =
			body && typeof body === "object" && "data" in body
				? body.data
				: undefined;
		const tracks = normalizeRecentTracks(data);
		return {
			albums: recentAlbumsFromTracks(tracks),
			fetchedAt: Date.now(),
		};
	},
	["music:recently-played:v2"],
	{ revalidate: RECENT_FRESH_MS / 1000 },
);

/** The cache may retain old data; the public response has a strict age limit. */
export function snapshotToRecentlyPlayedState(
	snapshot: Snapshot | null,
	serverTime = Date.now(),
): RecentlyPlayedState {
	const age = snapshot ? serverTime - snapshot.fetchedAt : Infinity;
	const available = snapshot !== null && age >= 0 && age < RECENT_MAX_AGE_MS;
	return {
		albums: available ? snapshot.albums : [],
		fetchedAt: available ? snapshot.fetchedAt : null,
		stale: available && age >= RECENT_FRESH_MS,
		unavailable: !available,
		serverTime,
	};
}

export async function getRecentlyPlayedState(): Promise<RecentlyPlayedState> {
	try {
		return snapshotToRecentlyPlayedState(await readSnapshot());
	} catch {
		// A cold cache failure is an unavailable response, never a cached empty history.
		console.error("Could not read recently played music");
		return snapshotToRecentlyPlayedState(null);
	}
}
