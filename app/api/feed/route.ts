import { generateRssFeed } from "@/lib/posts";

// Generate once at build time (posts are added via git commits)
export const dynamic = "force-static";

export async function GET() {
  try {
    // Use SITE_URL env var or default to production URL
    const baseUrl = process.env.SITE_URL || "https://matteing.com";

    // Generate the RSS feed
    const feed = await generateRssFeed(baseUrl);

    // Return the feed with proper headers
    return new Response(feed, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return new Response("Error generating feed", {
      status: 500,
    });
  }
}
