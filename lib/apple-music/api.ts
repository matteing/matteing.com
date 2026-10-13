import { AM_DEV_TOKEN, AM_USER_TOKEN } from "../config";
import { getAppleWebToken } from "./web-token";
import type { AppleMusicAlbum } from "./types";
import { RECENT_TRACKS_URL, REQUEST_TIMEOUT_MS } from "./shared.mjs";
import { catalogId } from "./normalize";

/**
 * Builds the authentication headers required for Apple Music API requests.
 *
 * @returns Headers object with Bearer token and Music-User-Token, or null if tokens are missing
 */
const getHeaders = (): HeadersInit | null => {
	if (!AM_USER_TOKEN || !AM_DEV_TOKEN) {
		return null;
	}
	return {
		Authorization: `Bearer ${AM_DEV_TOKEN}`,
		"Music-User-Token": AM_USER_TOKEN,
	};
};

/**
 * Fetches the user's recently played tracks from Apple Music.
 *
 * @returns The Apple Music response
 */
export const getRecentTracks = async (): Promise<Response> => {
	const headers = getHeaders();
	if (!headers) {
		throw new Error(
			"Apple Music authentication is unavailable. Configure AM_DEV_TOKEN and AM_USER_TOKEN.",
		);
	}
	return fetch(RECENT_TRACKS_URL, {
		method: "GET",
		headers,
		cache: "no-store",
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});
};

/** Resolve artwork through a catalog song without accessing the user's library. */
export async function getCatalogAlbumId(songId: string): Promise<string> {
	if (!catalogId(songId)) throw new Error("Invalid catalog song ID");
	if (!AM_DEV_TOKEN)
		throw new Error("Apple Music developer token unavailable");
	const response = await fetch(
		`https://api.music.apple.com/v1/catalog/us/songs/${songId}?include=albums`,
		{
			headers: { Authorization: `Bearer ${AM_DEV_TOKEN}` },
			cache: "no-store",
			redirect: "error",
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		},
	);
	if (!response.ok) throw new Error("Catalog song unavailable");
	const data = await response.json();
	const song = data?.data?.[0];
	const albumId =
		song?.type === "songs" && song.id === songId
			? catalogId(
					song.relationships?.albums?.data?.find(
						(album: { type?: unknown; id?: unknown } | null) =>
							album?.type === "albums" && catalogId(album.id),
					)?.id,
				)
			: null;
	if (!albumId) throw new Error("Catalog album unavailable");
	return albumId;
}

/**
 * Fetches album data from Apple Music catalog including animated artwork (editorialVideo).
 *
 * This function uses a cached web-player token to access Apple's internal AMP API.
 * The public developer token does not expose the editorialVideo extension.
 *
 * Note: This is a workaround because the official Apple Music API developer token
 * does not provide access to editorialVideo data - only the web player token does.
 *
 * @param albumId - The Apple Music album ID
 * @param storefront - The storefront/region code (default: 'us')
 * @returns The album data with editorialVideo if available, or null on error
 */
export const getAlbumFromCatalog = async (
	albumId: string,
	storefront: string = "us",
): Promise<AppleMusicAlbum | null> => {
	try {
		const webToken = await getAppleWebToken();
		if (!webToken) {
			console.log("Could not discover Apple Music web token");
			return null;
		}

		// Call the internal AMP API with the web token to get editorialVideo data.
		const url = `https://amp-api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}?extend=editorialVideo`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${webToken}`,
				origin: "https://music.apple.com",
			},
			cache: "no-store",
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!response.ok) {
			console.log("Album fetch with web token failed:", response.status);
			return null;
		}

		const data = await response.json();
		return (data.data?.[0] as AppleMusicAlbum) || null;
	} catch (e) {
		console.error("Error fetching album with web token:", e);
		return null;
	}
};
