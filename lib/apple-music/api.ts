import { AM_DEV_TOKEN, AM_USER_TOKEN } from "../config";
import { getAppleWebToken } from "./web-token";
import type {
  RecentTracksResult,
  CatalogSongResponse,
  AppleMusicAlbum,
} from "./types";

const RECENT_TRACKS_ENDPOINT = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=10`;
const REQUEST_TIMEOUT_MS = 10_000;

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
export const getRecentTracks = async (): Promise<RecentTracksResult> => {
  const headers = getHeaders();
  if (!headers) {
    throw new Error(
      "Apple Music authentication is unavailable. Configure AM_DEV_TOKEN and AM_USER_TOKEN."
    );
  }
  return fetch(RECENT_TRACKS_ENDPOINT, {
    method: "GET",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
};

/**
 * Fetches a song from the Apple Music catalog with album relationship data.
 *
 * @param songId - The Apple Music song ID
 * @param storefront - The storefront/region code (default: 'us')
 * @returns The song data with albums included, or null on error
 */
export const getSongFromCatalog = async (
  songId: string,
  storefront: string = "us"
): Promise<CatalogSongResponse | null> => {
  const headers = getHeaders();
  if (!headers) {
    return null;
  }

  const url = `https://api.music.apple.com/v1/catalog/${storefront}/songs/${songId}?include=albums`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data: CatalogSongResponse = await response.json();
    return data;
  } catch {
    return null;
  }
};

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
  storefront: string = "us"
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
