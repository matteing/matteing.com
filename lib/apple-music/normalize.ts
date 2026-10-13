import type { Album, Track } from "./types";
import { isAppleMusicTrack, parseHistory, trackDurationMs } from "./shared.mjs";

function record(value: unknown): Record<string, unknown> | null {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

function text(value: unknown): string | null {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function catalogId(value: unknown): string | null {
	return typeof value === "string" && /^\d{1,20}$/.test(value) ? value : null;
}

/** Only Apple links and artwork/preview CDN URLs are sent to the browser. */
export function appleUrl(value: unknown, artwork = false): string {
	if (typeof value !== "string") return "";
	try {
		const url = new URL(value);
		const appleCdn = url.hostname.endsWith(".mzstatic.com");
		const applePreview = url.hostname === "audio-ssl.itunes.apple.com";
		if (
			url.protocol !== "https:" ||
			url.port ||
			url.username ||
			url.password ||
			(artwork
				? !appleCdn
				: url.hostname !== "music.apple.com" &&
					!appleCdn &&
					!applePreview)
		) {
			return "";
		}
		return value.trim();
	} catch {
		return "";
	}
}

function artworkUrl(value: unknown, size: number): string {
	return appleUrl(value, true)
		.replaceAll("{w}", String(size))
		.replaceAll("{h}", String(size));
}

/** Fast normalization deliberately does no image downloads or catalog lookups. */
export function normalizeTrack(raw: unknown): Track | null {
	if (!isAppleMusicTrack(raw)) return null;
	const source = raw;
	const attributes = source.attributes;
	const id = source.id.trim();
	const name = attributes.name.trim();
	const artist = attributes.artistName.trim();

	const relationships = record(source.relationships);
	const catalogData = record(relationships?.catalog)?.data;
	const catalogSong = Array.isArray(catalogData)
		? catalogData
				.map(record)
				.find((song) => song?.type === "songs" && catalogId(song.id))
		: null;
	const catalogSongId =
		catalogId(
			source.type === "songs"
				? id
				: record(attributes.playParams)?.catalogId,
		) ?? catalogId(catalogSong?.id);
	const albumData = record(relationships?.albums)?.data;
	const albumReference = Array.isArray(albumData)
		? albumData
				.map(record)
				.find(
					(album) =>
						album &&
						text(album.id) &&
						(album.type === "albums" ||
							album.type === "library-albums"),
				)
		: null;
	const albumAttributes = record(albumReference?.attributes);
	const albumName =
		text(albumAttributes?.name) ?? text(attributes.albumName) ?? name;
	const albumArtist = text(albumAttributes?.artistName) ?? artist;
	const artwork =
		record(attributes.artwork) ?? record(albumAttributes?.artwork);
	const artworkTemplate = artwork?.url;
	const albumId =
		text(albumReference?.id) ??
		`album:${JSON.stringify([albumArtist.toLowerCase(), albumName.toLowerCase()])}`;
	const url = appleUrl(attributes.url);
	const previews = Array.isArray(attributes.previews)
		? attributes.previews
		: [];
	const previewUrl =
		previews
			.map((preview) => appleUrl(record(preview)?.url))
			.find(Boolean) ?? null;
	const color = text(artwork?.bgColor)?.replace(/^#/, "");

	return {
		id,
		...(catalogSongId ? { catalogSongId } : {}),
		name,
		artist,
		url,
		album: {
			id: albumId,
			name: albumName,
			artist: albumArtist,
			url: appleUrl(albumAttributes?.url) || url,
			coverUrl: artworkUrl(artworkTemplate, 600),
			hqCoverUrl: artworkUrl(artworkTemplate, 1200),
			videoUrl: null,
			hqVideoUrl: null,
			previewUrl,
		},
		blurDataUrl: "",
		previewUrl,
		dominantColor:
			color && /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : null,
		durationMs: trackDurationMs(attributes.durationInMillis),
	};
}

/** A malformed response must never erase the last good history as an empty list. */
export function normalizeRecentTracks(rawData: unknown): Track[] {
	return parseHistory({ data: rawData })
		.slice(0, 30)
		.map((raw) => normalizeTrack(raw)!);
}

/** Keep Apple's ordering, with one entry per album, across the entire snapshot. */
export function recentAlbumsFromTracks(tracks: Track[]): Album[] {
	const seen = new Set<string>();
	return tracks.flatMap(({ album }) => {
		if (seen.has(album.id)) return [];
		seen.add(album.id);
		return [album];
	});
}
