import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getAlbumFromCatalog, getCatalogAlbumId } from "@/lib/apple-music/api";
import { getVideoUrlFromM3u8 } from "@/lib/apple-music/m3u8";
import { appleUrl, catalogId } from "@/lib/apple-music/normalize";
import { getDominantColor } from "@/lib/images";
import type { ArtworkDetails, VideoUrls } from "@/lib/apple-music/types";

export const dynamic = "force-dynamic";

const getSongAlbum = unstable_cache(
	getCatalogAlbumId,
	["music:song-album:v1"],
	{ revalidate: 86400 },
);

const getAnimatedArtwork = unstable_cache(
	async (albumId: string): Promise<VideoUrls> => {
		const album = await getAlbumFromCatalog(albumId);
		if (!album) throw new Error("Album artwork unavailable");
		const video = album.attributes.editorialVideo;
		const manifest =
			video?.motionSquareVideo1x1?.video ||
			video?.motionDetailSquare?.video;
		if (!manifest) return { standard: null, hq: null };
		const result = await getVideoUrlFromM3u8(manifest);
		// Failed enrichment must not become a cached absence of artwork.
		if (!result.standard) throw new Error("Animated artwork unavailable");
		return result;
	},
	["music:artwork:v2"],
	{ revalidate: 86400 },
);

const getArtworkColor = unstable_cache(
	async (coverUrl: string): Promise<string> => {
		const color = await getDominantColor(coverUrl);
		if (!color) throw new Error("Artwork color unavailable");
		return color;
	},
	["music:artwork-color:v1"],
	{ revalidate: 86400 },
);

/** Optional decoration, requested independently after the live card is visible. */
export async function GET(request: Request) {
	const params = new URL(request.url).searchParams;
	const rawAlbumId = params.get("albumId");
	const albumId = catalogId(rawAlbumId);
	const rawSongId = params.get("songId");
	const songId = catalogId(rawSongId);
	const rawCoverUrl = params.get("coverUrl");
	const coverUrl = appleUrl(rawCoverUrl, true);
	if (
		(!albumId && !songId && !coverUrl) ||
		(rawAlbumId !== null && !albumId) ||
		(rawSongId !== null && !songId) ||
		(rawCoverUrl !== null && !coverUrl)
	) {
		return NextResponse.json(
			{ error: "Invalid artwork request" },
			{ status: 400, headers: { "Cache-Control": "no-store" } },
		);
	}
	const [video, color] = await Promise.allSettled([
		albumId
			? getAnimatedArtwork(albumId)
			: songId
				? getSongAlbum(songId).then(getAnimatedArtwork)
				: Promise.resolve(null),
		coverUrl ? getArtworkColor(coverUrl) : Promise.resolve(null),
	]);
	const details: ArtworkDetails = {
		standard:
			video.status === "fulfilled"
				? (video.value?.standard ?? null)
				: null,
		hq: video.status === "fulfilled" ? (video.value?.hq ?? null) : null,
		dominantColor: color.status === "fulfilled" ? color.value : null,
	};
	const succeeded =
		((albumId || songId) && video.status === "fulfilled") ||
		(coverUrl && color.status === "fulfilled");
	const failed = video.status === "rejected" || color.status === "rejected";
	if (failed) details.retryable = true;
	return NextResponse.json(details, {
		status: succeeded ? 200 : 503,
		headers: {
			// Cache each successful enrichment independently, never a partial failure.
			"Cache-Control": failed
				? "no-store"
				: "public, max-age=3600, s-maxage=86400",
		},
	});
}
