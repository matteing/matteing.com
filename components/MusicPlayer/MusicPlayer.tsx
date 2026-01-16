"use client";

/**
 * MusicPlayer Component
 *
 * Displays the currently playing track from Apple Music with:
 * - Album artwork (with optional animated video)
 * - Track name and artist
 * - Real-time progress bar
 * - Recently played albums
 *
 * The component adapts its colors based on the album's dominant color.
 * Supports server-side preloading via initialData prop.
 */

import { useMemo, useState, useCallback } from "react";
import useSWR from "swr";
import { motion } from "motion/react";
import type { NowPlayingState } from "@/lib/apple-music/types";

import { SoundBars } from "./components/SoundBars";
import { AlbumArt } from "./components/AlbumArt";
import { TrackInfo } from "./components/TrackInfo";
import {
  RecentlyPlayed,
  RecentlyPlayedExpanded,
} from "./components/RecentlyPlayed";
import { usePlaybackProgress } from "./hooks/usePlaybackProgress";
import { shouldUseLightText, darkenColor } from "./utils/colors";

// ============================================================================
// Types
// ============================================================================

interface MusicPlayerProps {
  /** Pre-fetched data from server for instant hydration */
  initialData?: NowPlayingState;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_DURATION = 180000; // 3 minutes fallback
const REFRESH_INTERVAL = 60000; // Refresh every 60 seconds (API caches for 1 min)

// ============================================================================
// Helpers
// ============================================================================

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Check if a track is currently playing based on API state and elapsed time.
 */
function isTrackPlaying(data: NowPlayingState | undefined): boolean {
  if (!data?.isPlaying || !data.startedAt || !data.track) return false;
  
  const startTime = new Date(data.startedAt).getTime();
  const endTime = startTime + data.track.durationMs + 5000; // 5s buffer
  return Date.now() < endTime;
}

// ============================================================================
// Main Component
// ============================================================================

export default function MusicPlayer({ initialData }: MusicPlayerProps) {
  // Fetch now-playing data from API, with optional server-side preload
  const { data, mutate } = useSWR<NowPlayingState>(
    "/api/now-playing",
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnMount: true,
      refreshInterval: REFRESH_INTERVAL,
      dedupingInterval: 30000,
    }
  );

  // Extract data
  const track = data?.track;
  const recentAlbums = data?.recentAlbums;
  const dominantColor = track?.dominantColor;
  const durationMs = track?.durationMs ?? DEFAULT_DURATION;
  const startedAt = data?.startedAt ?? null;

  // API says playing, but check if client-side ended
  const apiIsPlaying = isTrackPlaying(data);

  // Track which startedAt we've marked as ended
  const [endedTrackKey, setEndedTrackKey] = useState<string | null>(null);
  const trackKey = startedAt ?? null;

  // Only consider ended if it's the same track that ended
  const hasEnded = endedTrackKey !== null && endedTrackKey === trackKey;
  const isPlaying = apiIsPlaying && !hasEnded;

  // Handle track end - mark this specific track as ended
  const handleTrackEnd = useCallback(() => {
    setEndedTrackKey(trackKey);
    mutate();
  }, [mutate, trackKey]);

  // Track playback progress
  const { currentTime } = usePlaybackProgress({
    isPlaying,
    startedAt,
    durationMs,
    onTrackEnd: handleTrackEnd,
  });

  // Calculate colors based on dominant color
  // Use inline styles with explicit colors to avoid CSS variable inversion in dark mode
  const { darkerColor, textColor } = useMemo(() => {
    const useLightText = shouldUseLightText(dominantColor ?? null);
    return {
      darkerColor: darkenColor(dominantColor ?? null, 25),
      textColor: useLightText ? "#ffffff" : "#1a1a1a",
    };
  }, [dominantColor]);

  // Determine what content to show
  const isLoading = !data;
  const showNowPlaying = !isLoading && isPlaying && track;
  const showRecentlyPlayed = !isLoading && !isPlaying && recentAlbums && recentAlbums.length > 0;

  // Render content based on state
  const renderContent = () => {
    // Loading/fallback state
    if (isLoading || (!showNowPlaying && !showRecentlyPlayed)) {
      return (
        <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 p-4 text-gray-900 sm:p-5">
          <span className="text-sm text-gray-500">Fetching some tunes...</span>
        </div>
      );
    }

    // Recently played (not currently playing)
    if (showRecentlyPlayed) {
      return <RecentlyPlayedExpanded albums={recentAlbums!} />;
    }

    // Now playing
    return (
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ 
          backgroundColor: dominantColor || "var(--color-white)",
          color: textColor,
        }}
      >
        <div className="relative flex flex-col sm:flex-row">
          <SoundBars />
          <AlbumArt
            album={track!.album}
            dominantColor={dominantColor ?? undefined}
          />
          <TrackInfo
            name={track!.name}
            artist={track!.artist}
            url={track!.url}
            currentTime={currentTime}
            duration={durationMs}
          />
        </div>
        {recentAlbums && recentAlbums.length > 0 && (
          <RecentlyPlayed
            albums={recentAlbums}
            maxItems={4}
            backgroundColor={darkerColor}
            textColor={textColor}
          />
        )}
      </div>
    );
  };

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-xl"
      style={{ minHeight: 330 }}
      transition={{ layout: { type: "spring", stiffness: 260, damping: 32, mass: 0.8 } }}
    >
      {renderContent()}
    </motion.div>
  );
}
