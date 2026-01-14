import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshNowPlaying } from "@/lib/apple-music/now-playing";

/**
 * Cron endpoint to refresh now-playing state.
 * 
 * Checks Apple Music for the latest track. If changed:
 * - Pushes old track to history (max 10)
 * - Sets new track as current
 * - Revalidates homepage
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshNowPlaying();

    if (result.changed) {
      revalidatePath("/");
    }

    return NextResponse.json({
      success: true,
      ...result,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron now-playing error:", error);
    return NextResponse.json(
      { error: "Failed to refresh now-playing" },
      { status: 500 }
    );
  }
}
