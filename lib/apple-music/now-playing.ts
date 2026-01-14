import { getJSON, setJSON } from "@/lib/redis";
import { getBlurFromRemoteSource, getDominantColor } from "@/lib/images";
import { getRecentTracks, getSongFromCatalog, getAlbumFromCatalog } from "@/lib/apple-music/api";
import { getVideoUrlFromM3u8 } from "@/lib/apple-music/m3u8";
import type { AppleMusicTrack, Track, Album, NowPlayingState } from "@/lib/apple-music/types";

// Redis keys
const KEY_CURRENT = "now-playing:current";
const KEY_HISTORY = "now-playing:history";

// =============================================================================
// Types
// =============================================================================

interface StoredTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumId: string | null;
  coverUrl: string;
  hqCoverUrl: string;
  url: string;
  durationMs: number;
  blurDataUrl: string;
  dominantColor: string | null;
  previewUrl: string | null;
  videoUrl: string | null;
  hqVideoUrl: string | null;
  startedAt: string;
}

// =============================================================================
// Redis Operations
// =============================================================================

async function getCurrent(): Promise<StoredTrack | null> {
  return getJSON<StoredTrack>(KEY_CURRENT);
}

async function setCurrent(track: StoredTrack): Promise<boolean> {
  return setJSON(KEY_CURRENT, track);
}

async function getHistory(): Promise<StoredTrack[]> {
  return (await getJSON<StoredTrack[]>(KEY_HISTORY)) ?? [];
}

async function pushToHistory(track: StoredTrack): Promise<boolean> {
  const history = await getHistory();
  
  // Don't add duplicates (same track ID)
  if (history.some((t) => t.id === track.id)) {
    return true;
  }
  
  // Add to front, keep max 10
  const updated = [track, ...history].slice(0, 10);
  return setJSON(KEY_HISTORY, updated);
}

// =============================================================================
// Track Processing
// =============================================================================

async function processTrack(raw: AppleMusicTrack): Promise<StoredTrack> {
  const coverUrl = raw.attributes.artwork.url
    .replace("{w}", "600")
    .replace("{h}", "600");
  const hqCoverUrl = raw.attributes.artwork.url
    .replace("{w}", "1200")
    .replace("{h}", "1200");

  // Fetch image data and video URLs in parallel
  const [blurData, dominantColor, videoData] = await Promise.all([
    getBlurFromRemoteSource(hqCoverUrl),
    getDominantColor(hqCoverUrl),
    fetchVideoUrls(raw.id),
  ]);

  return {
    id: raw.id,
    name: raw.attributes.name,
    artist: raw.attributes.artistName,
    albumName: raw.attributes.albumName,
    albumId: videoData.albumId,
    coverUrl,
    hqCoverUrl,
    url: raw.attributes.url,
    durationMs: raw.attributes.durationInMillis || 180000,
    blurDataUrl: blurData?.base64 ?? "",
    dominantColor,
    previewUrl: raw.attributes.previews?.[0]?.url || null,
    videoUrl: videoData.videoUrl,
    hqVideoUrl: videoData.hqVideoUrl,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Fetch video URLs for animated album artwork.
 */
async function fetchVideoUrls(songId: string): Promise<{
  albumId: string | null;
  videoUrl: string | null;
  hqVideoUrl: string | null;
}> {
  try {
    const catalog = await getSongFromCatalog(songId);
    const albumId = catalog?.data?.[0]?.relationships?.albums?.data?.[0]?.id || null;
    
    if (!albumId) {
      return { albumId: null, videoUrl: null, hqVideoUrl: null };
    }

    const details = await getAlbumFromCatalog(albumId);
    const video = details?.attributes?.editorialVideo;
    const m3u8 = video?.motionSquareVideo1x1?.video || video?.motionDetailSquare?.video;

    if (m3u8) {
      const urls = await getVideoUrlFromM3u8(m3u8);
      return { albumId, videoUrl: urls.standard, hqVideoUrl: urls.hq };
    }

    return { albumId, videoUrl: null, hqVideoUrl: null };
  } catch {
    return { albumId: null, videoUrl: null, hqVideoUrl: null };
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Check Apple Music for the latest track and update Redis if changed.
 * Returns { changed: boolean, track: string | null }
 */
export async function refreshNowPlaying(): Promise<{
  changed: boolean;
  track: string | null;
  isPlaying: boolean;
}> {
  try {
    // Fetch latest from Apple Music
    const response = await getRecentTracks();
    if (response.status === 204 || response.status > 400) {
      return { changed: false, track: null, isPlaying: false };
    }

    const { data } = await response.json();
    if (!data?.length) {
      return { changed: false, track: null, isPlaying: false };
    }

    const latestTrack = data[0] as AppleMusicTrack;
    const current = await getCurrent();

    // Check if track changed
    if (current?.id === latestTrack.id) {
      // Same track - check if still playing
      const elapsed = Date.now() - new Date(current.startedAt).getTime();
      const isPlaying = elapsed < current.durationMs + 4 * 60 * 1000; // 4 min buffer
      return { changed: false, track: current.name, isPlaying };
    }

    // Track changed - push old to history, set new as current
    if (current) {
      await pushToHistory(current);
    }

    const processed = await processTrack(latestTrack);
    await setCurrent(processed);

    return { changed: true, track: processed.name, isPlaying: true };
  } catch (error) {
    // Network error or timeout - return cached state if available
    console.error("Failed to refresh from Apple Music:", error);
    const current = await getCurrent();
    if (current) {
      const elapsed = Date.now() - new Date(current.startedAt).getTime();
      const isPlaying = elapsed < current.durationMs + 4 * 60 * 1000;
      return { changed: false, track: current.name, isPlaying };
    }
    return { changed: false, track: null, isPlaying: false };
  }
}

/**
 * Get the current now-playing state for the API/frontend.
 */
export async function getNowPlayingState(): Promise<NowPlayingState> {
  const [current, history] = await Promise.all([getCurrent(), getHistory()]);

  if (!current) {
    return {
      track: null,
      isPlaying: false,
      recentAlbums: historyToAlbums(history),
      startedAt: null,
    };
  }

  // Check if still playing
  const elapsed = Date.now() - new Date(current.startedAt).getTime();
  const isPlaying = elapsed < current.durationMs + 4 * 60 * 1000;

  const track: Track = {
    id: current.id,
    name: current.name,
    url: current.url,
    artist: current.artist,
    album: {
      id: current.albumId || `album-${current.albumName.toLowerCase().replace(/\s+/g, "-")}`,
      name: current.albumName,
      url: current.url,
      artist: current.artist,
      coverUrl: current.coverUrl,
      hqCoverUrl: current.hqCoverUrl,
      videoUrl: current.videoUrl,
      hqVideoUrl: current.hqVideoUrl,
      previewUrl: current.previewUrl,
    },
    blurDataUrl: current.blurDataUrl,
    previewUrl: current.previewUrl,
    dominantColor: current.dominantColor,
    durationMs: current.durationMs,
  };

  return {
    track,
    isPlaying,
    recentAlbums: historyToAlbums(history),
    startedAt: current.startedAt,
  };
}

/**
 * Convert history tracks to album format for display.
 * Deduplicates by album name.
 */
function historyToAlbums(history: StoredTrack[]): Album[] {
  const seen = new Set<string>();
  const albums: Album[] = [];

  for (const track of history) {
    if (seen.has(track.albumName)) continue;
    seen.add(track.albumName);

    albums.push({
      id: track.albumId || `album-${track.albumName.toLowerCase().replace(/\s+/g, "-")}`,
      name: track.albumName,
      artist: track.artist,
      url: track.url,
      coverUrl: track.coverUrl.replace("600x600", "100x100"),
      hqCoverUrl: track.coverUrl,
      videoUrl: track.videoUrl,
      hqVideoUrl: track.hqVideoUrl,
      previewUrl: track.previewUrl,
    });
  }

  return albums;
}

// Legacy export for page.tsx
export const readState = getNowPlayingState;
