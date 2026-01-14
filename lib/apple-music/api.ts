import { AM_USER_TOKEN, AM_DEV_TOKEN } from "../config";
import type {
  RecentTracksResult,
  MockedResponse,
  CatalogSongResponse,
  AppleMusicAlbum,
} from "./types";

const user_token = AM_USER_TOKEN;
const dev_token = AM_DEV_TOKEN;

const RECENT_TRACKS_ENDPOINT = `https://api.music.apple.com/v1/me/recent/played/tracks?limit=10`;

/**
 * Builds the authentication headers required for Apple Music API requests.
 *
 * @returns Headers object with Bearer token and Music-User-Token, or null if tokens are missing
 */
const getHeaders = (): HeadersInit | null => {
  if (!user_token || !dev_token) {
    return null;
  }
  return {
    Authorization: `Bearer ${dev_token}`,
    "Music-User-Token": user_token,
  };
};

/**
 * Fetches the user's recently played tracks from Apple Music.
 *
 * @returns A fetch Response promise, or a mocked 204 response if auth is unavailable
 */
export const getRecentTracks = async (): Promise<RecentTracksResult> => {
  const headers = getHeaders();
  if (!headers) {
    // Return a mocked response that will result in "not playing"
    const mockedResponse: MockedResponse = {
      status: 204,
      json: async () => ({}),
    };
    return mockedResponse;
  }
  return fetch(RECENT_TRACKS_ENDPOINT, {
    method: "GET",
    headers,
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
 * This function uses a reverse-engineered approach to access Apple's internal AMP API:
 * 1. Scrapes the Apple Music web player to find the JS bundle
 * 2. Extracts the embedded JWT web token from the bundle
 * 3. Uses that token to call the amp-api endpoint with editorialVideo extension
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
    // Step 1: Fetch the Apple Music web player HTML to find the JS bundle path
    const webTokenResponse = await fetch(
      "https://music.apple.com/us/album/1693323844"
    );
    const html = await webTokenResponse.text();

    // Step 2: Extract the JS bundle path from the HTML (matches pattern like /assets/index-xxx.js)
    const jsPathMatch = html.match(
      /crossorigin src="(\/assets\/index[^"]+\.js)"/
    );
    if (!jsPathMatch) {
      console.log("Could not find JS bundle path");
      return null;
    }

    // Step 3: Fetch the JS bundle and extract the embedded JWT token
    // The token starts with "eyJhbGc" (base64 for {"alg) which is the JWT header
    const jsResponse = await fetch(`https://music.apple.com${jsPathMatch[1]}`);
    const jsText = await jsResponse.text();
    const tokenMatch = jsText.match(/(eyJhbGc[^"]+)/);

    if (!tokenMatch) {
      console.log("Could not extract web token");
      return null;
    }

    const webToken = tokenMatch[1];

    // Step 4: Call the internal AMP API with the web token to get editorialVideo data
    const url = `https://amp-api.music.apple.com/v1/catalog/${storefront}/albums/${albumId}?extend=editorialVideo`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${webToken}`,
        origin: "https://music.apple.com",
      },
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
