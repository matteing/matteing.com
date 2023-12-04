import {
	AM_USER_TOKEN,
	AM_DEV_TOKEN,
	NEXT_PUBLIC_MUSIC_SERVICE,
} from "../config";

const user_token = AM_USER_TOKEN;
const dev_token = AM_DEV_TOKEN;

const RECENT_TRACKS_ENDPOINT = `https://api.music.apple.com/v1/me/recent/played/tracks/?limit=10`;
const RECENT_RESOURCES_ENDPOINT = `https://api.music.apple.com/v1/me/recent/played/?limit=10`;

if (
	NEXT_PUBLIC_MUSIC_SERVICE === "apple-music" &&
	(!user_token || !dev_token)
) {
	throw new Error(
		"Missing Apple Music user token or developer token. Please add them to your .env.local file."
	);
}

const headers = {
	Authorization: `Bearer ${dev_token}`,
	"Music-User-Token": user_token,
} as HeadersInit;

export const getRecentResources = async () => {
	return fetch(RECENT_RESOURCES_ENDPOINT, {
		method: "GET",
		headers,
	});
};

export const getRecentTracks = async () => {
	return fetch(RECENT_TRACKS_ENDPOINT, {
		method: "GET",
		headers,
	});
};
