import type { VideoUrls, HLSStream } from "./types";

/* =============================================================================
 * M3U8 Reverse Engineering Functions
 *
 * Apple Music serves animated artwork (editorialVideo) as HLS streams via m3u8 playlists.
 * These functions parse the m3u8 playlist structure to extract direct MP4 URLs that can
 * be used in standard <video> elements without requiring an HLS player.
 *
 * How Apple's HLS structure works:
 * 1. Master playlist (.m3u8) - Contains multiple quality variants with bandwidth/resolution
 * 2. Media playlist (.m3u8) - For each quality, lists the actual video segments
 * 3. Video segments (.mp4) - fMP4 (fragmented MP4) files that can be played directly
 *
 * The EXT-X-MAP directive in media playlists points to the initialization segment,
 * which for Apple's fMP4 streams is often the complete playable video file.
 * ============================================================================= */

/**
 * Extracts a direct MP4 URL from an HLS media playlist.
 *
 * Parses a media-level m3u8 playlist to find the MP4 file URL. Apple uses fMP4
 * (fragmented MP4) format where the EXT-X-MAP URI typically points to a complete
 * playable video file rather than just an initialization segment.
 *
 * @param playlistUrl - URL to the media playlist (.m3u8)
 * @returns Direct URL to the MP4 file, or null if not found
 *
 * @example
 * // Media playlist structure:
 * // #EXTM3U
 * // #EXT-X-MAP:URI="video.mp4"
 * // #EXTINF:10.0,
 * // segment.ts
 */
const getMp4FromMediaPlaylist = async (
  playlistUrl: string
): Promise<string | null> => {
  try {
    const mediaResponse = await fetch(playlistUrl);
    const mediaText = await mediaResponse.text();
    const mediaLines = mediaText.split("\n");

    const mediaBaseUrl = playlistUrl.substring(
      0,
      playlistUrl.lastIndexOf("/") + 1
    );

    // Primary method: Look for EXT-X-MAP directive which contains the fMP4 initialization segment
    // In Apple's implementation, this is typically the complete video file
    for (const line of mediaLines) {
      if (line.startsWith("#EXT-X-MAP:")) {
        const uriMatch = line.match(/URI="([^"]+)"/);
        if (uriMatch) {
          const mp4File = uriMatch[1];
          return mp4File.startsWith("http") ? mp4File : mediaBaseUrl + mp4File;
        }
      }
    }

    // Fallback: Look for .mp4 files in segment lines (non-comment lines)
    for (const line of mediaLines) {
      if (line.trim() && !line.startsWith("#") && line.includes(".mp4")) {
        return line.startsWith("http")
          ? line.trim()
          : mediaBaseUrl + line.trim();
      }
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Parses an HLS master playlist to extract direct MP4 URLs at multiple quality levels.
 *
 * This function reverse-engineers Apple's HLS streaming format to get playable video URLs:
 * 1. Fetches and parses the master m3u8 playlist
 * 2. Extracts all available quality streams with their bandwidth and resolution
 * 3. Selects appropriate streams for standard (thumbnail) and HQ (expanded) display
 * 4. Resolves each stream's media playlist to find the actual MP4 file URLs
 *
 * @param m3u8Url - URL to the master HLS playlist
 * @returns Object containing standard and HQ quality MP4 URLs
 *
 * @example
 * // Master playlist structure:
 * // #EXTM3U
 * // #EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x360
 * // quality_360p/playlist.m3u8
 * // #EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
 * // quality_720p/playlist.m3u8
 */
export const getVideoUrlFromM3u8 = async (
  m3u8Url: string
): Promise<VideoUrls> => {
  try {
    const response = await fetch(m3u8Url);
    const text = await response.text();

    // Parse the master m3u8 to extract all available quality streams
    const lines = text.split("\n");
    const streams: HLSStream[] = [];
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // EXT-X-STREAM-INF contains metadata about each quality variant
      if (line.startsWith("#EXT-X-STREAM-INF:")) {
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
        const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0;
        const resolution = resolutionMatch?.[1];
        const width = resolution
          ? parseInt(resolution.split("x")[0])
          : undefined;

        // The URL follows on the next line
        const streamUrl = lines[i + 1]?.trim();
        if (streamUrl && !streamUrl.startsWith("#")) {
          const fullUrl = streamUrl.startsWith("http")
            ? streamUrl
            : baseUrl + streamUrl;
          streams.push({ bandwidth, resolution, width, url: fullUrl });
        }
      }
    }

    if (streams.length === 0) {
      return { standard: null, hq: null };
    }

    // Sort streams by bandwidth (ascending) to select appropriate quality levels
    streams.sort((a, b) => a.bandwidth - b.bandwidth);

    // Select standard quality: prefer 480-720px width for thumbnail display
    // This balances quality vs bandwidth for small UI elements
    let standardStream = streams[0];
    const idealStandard = streams.find(
      (s) => s.width && s.width >= 480 && s.width <= 720
    );
    if (idealStandard) {
      standardStream = idealStandard;
    } else if (streams.length >= 3) {
      // Fallback: pick lower-middle quality tier
      standardStream = streams[Math.floor(streams.length / 3)];
    }

    // HQ stream is always the highest bandwidth available
    const hqStream = streams[streams.length - 1];

    // Resolve media playlists to get direct MP4 URLs in parallel
    const [standard, hq] = await Promise.all([
      getMp4FromMediaPlaylist(standardStream.url),
      hqStream !== standardStream
        ? getMp4FromMediaPlaylist(hqStream.url)
        : null,
    ]);

    return {
      standard,
      hq: hq || standard, // Fall back to standard if HQ fetch fails
    };
  } catch (e) {
    console.error("Error parsing m3u8:", e);
    return { standard: null, hq: null };
  }
};
