import { NextResponse } from "next/server";
import { getRecentlyPlayedState } from "@/lib/apple-music/recently-played";

export const dynamic = "force-dynamic";

const headers = {
	"Cache-Control": "no-store, max-age=0",
	"CDN-Cache-Control": "no-store",
	"Vercel-CDN-Cache-Control": "no-store",
};

/** Recent history stays independent of the local now-playing sync process. */
export async function GET() {
	return NextResponse.json(await getRecentlyPlayedState(), { headers });
}
