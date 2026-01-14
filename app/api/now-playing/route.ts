import { NextResponse } from "next/server";
import { getNowPlayingState } from "@/lib/apple-music/now-playing";

/**
 * API route that serves the now-playing state from Redis.
 */
export async function GET() {
  try {
    const state = await getNowPlayingState();

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error reading now playing state:", error);
    return NextResponse.json(
      { track: null, isPlaying: false, recentAlbums: [], startedAt: null },
      { status: 500 }
    );
  }
}
