import { NextResponse } from "next/server";
import { getNowPlayingState, refreshNowPlaying } from "@/lib/apple-music/now-playing";

/**
 * API route that serves the now-playing state.
 * 
 * On each request (after cache expires), it refreshes the state from Apple Music
 * and returns the current state. Uses 1-minute caching with stale-while-revalidate
 * to avoid excessive API calls while keeping data fresh.
 */
export async function GET() {
  try {
    // Refresh from Apple Music (updates Redis if track changed)
    await refreshNowPlaying();
    
    // Get the current state
    const state = await getNowPlayingState();

    return NextResponse.json(state, {
      headers: {
        // Cache for 60 seconds, serve stale for 120s while revalidating
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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
