export const NEXT_PUBLIC_URL =
	process.env.NEXT_PUBLIC_URL ?? "https://matteing.com";

export const NEXT_PUBLIC_GHOST_URL =
	process.env.NEXT_PUBLIC_GHOST_URL ?? "https://cms.matteing.com";
export const NEXT_PUBLIC_GHOST_CONTENT_KEY =
	process.env.NEXT_PUBLIC_GHOST_CONTENT_KEY;
export const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_KEY;
export const GHOST_RSS_ENDPOINT =
	process.env.GHOST_RSS_ENDPOINT ?? "https://cms.matteing.com/rss";

export const NEXT_PUBLIC_MUSIC_SERVICE =
	(process.env.NEXT_PUBLIC_MUSIC_SERVICE as
		| "apple-music"
		| "spotify"
		| undefined) ?? "spotify";

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

export const AM_USER_TOKEN = process.env.AM_USER_TOKEN;
export const AM_DEV_TOKEN = process.env.AM_DEV_TOKEN;

export const DISCORD_HOOK = process.env.DISCORD_HOOK;
export const REVALIDATE_KEY = process.env.REVALIDATE_KEY;
