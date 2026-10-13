import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getAlbumFromCatalog } from "@/lib/apple-music/api";
import { getVideoUrlFromM3u8 } from "@/lib/apple-music/m3u8";
import type { VideoUrls } from "@/lib/apple-music/types";

export const dynamic = "force-dynamic";

const getArtwork = unstable_cache(
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

/** Optional decoration, requested independently after the live card is visible. */
export async function GET(request: Request) {
	const albumId = new URL(request.url).searchParams.get("albumId");
	if (!albumId || !/^\d{1,20}$/.test(albumId)) {
		return NextResponse.json(
			{ error: "Invalid album ID" },
			{ status: 400, headers: { "Cache-Control": "no-store" } },
		);
	}
	try {
		return NextResponse.json(await getArtwork(albumId), {
			headers: {
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	} catch {
		return NextResponse.json(
			{ standard: null, hq: null },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}
}
