import { getJSON, setJSON } from "@/lib/redis";
import { getBlurFromRemoteSource, getDominantColor } from "@/lib/images";
import { getRecentTracks, getSongFromCatalog, getAlbumFromCatalog } from "@/lib/apple-music/api";
import { getVideoUrlFromM3u8 } from "@/lib/apple-music/m3u8";
import type { AppleMusicTrack, Track, Album, NowPlayingState } from "@/lib/apple-music/types";

// Single Redis key - a stack of recently played tracks
const KEY_HISTORY = "now-playing:history";

// Max tracks to keep in history
const MAX_HISTORY = 10;

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
// Redis Operations (single stack)
// =============================================================================

async function getHistory(): Promise<StoredTrack[]> {
  return (await getJSON<StoredTrack[]>(KEY_HISTORY)) ?? [];
}

async function setHistory(history: StoredTrack[]): Promise<boolean> {
  return setJSON(KEY_HISTORY, history);
}

/**
 * Push a track to the front of history.
 * Dedupes by album name and caps at MAX_HISTORY.
 */
async function pushTrack(track: StoredTrack): Promise<boolean> {
  if (!track.coverUrl) return true;

  const history = await getHistory();
  const filtered = history.filter((t) => t.albumName !== track.albumName);
  const updated = [track, ...filtered].slice(0, MAX_HISTORY);
  return setHistory(updated);
}

// =============================================================================
// Track Processing
// =============================================================================

async function processTrack(raw: AppleMusicTrack): Promise<StoredTrack | null> {
  if (!raw.attributes.artwork?.url) return null;

  const coverUrl = raw.attributes.artwork.url.replace("{w}", "600").replace("{h}", "600");
  const hqCoverUrl = raw.attributes.artwork.url.replace("{w}", "1200").replace("{h}", "1200");

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

async function fetchVideoUrls(songId: string): Promise<{
  albumId: string | null;
  videoUrl: string | null;
  hqVideoUrl: string | null;
}> {
  try {
    const catalog = await getSongFromCatalog(songId);
    const albumId = catalog?.data?.[0]?.relationships?.albums?.data?.[0]?.id || null;

    if (!albumId) return { albumId: null, videoUrl: null, hqVideoUrl: null };

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
// Helpers
// =============================================================================

/**
 * Check if a track is currently playing based on startedAt time.
 * Playing = started recently enough that it hasn't ended yet (with buffer).
 */
function isTrackPlaying(track: StoredTrack): boolean {
  const elapsed = Date.now() - new Date(track.startedAt).getTime();
  return elapsed < track.durationMs + 4 * 60 * 1000; // 4 min buffer for pauses
}

function storedToTrack(stored: StoredTrack): Track {
  return {
    id: stored.id,
    name: stored.name,
    url: stored.url,
    artist: stored.artist,
    album: {
      id: stored.albumId || `album-${stored.albumName.toLowerCase().replace(/\s+/g, "-")}`,
      name: stored.albumName,
      url: stored.url,
      artist: stored.artist,
      coverUrl: stored.coverUrl,
      hqCoverUrl: stored.hqCoverUrl,
      videoUrl: stored.videoUrl,
      hqVideoUrl: stored.hqVideoUrl,
      previewUrl: stored.previewUrl,
    },
    blurDataUrl: stored.blurDataUrl,
    previewUrl: stored.previewUrl,
    dominantColor: stored.dominantColor,
    durationMs: stored.durationMs,
  };
}

function historyToAlbums(history: StoredTrack[], skip: number = 0): Album[] {
  const seen = new Set<string>();
  const albums: Album[] = [];

  for (const track of history.slice(skip)) {
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

// =============================================================================
// Public API
// =============================================================================

/**
 * Refresh from Apple Music and update the history stack.
 * New tracks get pushed to the front. That's it.
 */
export async function refreshNowPlaying(): Promise<{
  changed: boolean;
  track: string | null;
  isPlaying: boolean;
}> {
  try {
    const response = await getRecentTracks();
    if (response.status === 204 || response.status > 400) {
      const history = await getHistory();
      const head = history[0];
      return {
        changed: false,
        track: head?.name ?? null,
        isPlaying: head ? isTrackPlaying(head) : false,
      };
    }

    const { data } = await response.json();
    if (!data?.length) {
      const history = await getHistory();
      const head = history[0];
      return {
        changed: false,
        track: head?.name ?? null,
        isPlaying: head ? isTrackPlaying(head) : false,
      };
    }

    const latestTrack = data[0] as AppleMusicTrack;
    const history = await getHistory();
    const head = history[0];

    // Same track as head? No change needed.
    if (head?.id === latestTrack.id) {
      return {
        changed: false,
        track: head.name,
        isPlaying: isTrackPlaying(head),
      };
    }

    // New track - process and push to history
    const processed = await processTrack(latestTrack);
    if (!processed) {
      return {
        changed: false,
        track: head?.name ?? null,
        isPlaying: head ? isTrackPlaying(head) : false,
      };
    }

    await pushTrack(processed);
    return { changed: true, track: processed.name, isPlaying: true };
  } catch (error) {
    console.error("Failed to refresh from Apple Music:", error);
    const history = await getHistory();
    const head = history[0];
    return {
      changed: false,
      track: head?.name ?? null,
      isPlaying: head ? isTrackPlaying(head) : false,
    };
  }
}

/**
 * Get the current now-playing state.
 * 
 * - track: history[0] if it's fresh (playing), otherwise null
 * - isPlaying: whether history[0] is still playing
 * - recentAlbums: the rest of history (or all of it if not playing)
 */
export async function getNowPlayingState(): Promise<NowPlayingState> {
  const history = await getHistory();

  if (!history.length) {
    return { track: null, isPlaying: false, recentAlbums: [], startedAt: null };
  }

  const head = history[0];
  const isPlaying = isTrackPlaying(head);

  if (isPlaying) {
    // Currently playing - head is the track, rest is recentAlbums
    return {
      track: storedToTrack(head),
      isPlaying: true,
      recentAlbums: historyToAlbums(history, 1), // skip head
      startedAt: head.startedAt,
    };
  }

  // Not playing - no current track, all history is recentAlbums
  return {
    track: null,
    isPlaying: false,
    recentAlbums: historyToAlbums(history, 0),
    startedAt: null,
  };
}

// Legacy export for page.tsx
export const readState = getNowPlayingState;
