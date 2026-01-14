"use client";

import { useState, useEffect } from "react";

interface UsePlaybackProgressOptions {
  /** Whether music is currently playing */
  isPlaying: boolean;
  /** ISO timestamp when the track started */
  startedAt: string | null;
  /** Track duration in milliseconds */
  durationMs: number;
  /** Callback to refresh data when track ends */
  onTrackEnd?: () => void;
}

interface UsePlaybackProgressReturn {
  /** Current playback position in milliseconds */
  currentTime: number;
  /** Progress as percentage (0-100) */
  progressPercent: number;
}

/**
 * Hook to track playback progress based on startedAt timestamp.
 * Updates every second and triggers onTrackEnd when the song finishes.
 */
export function usePlaybackProgress({
  isPlaying,
  startedAt,
  durationMs,
  onTrackEnd,
}: UsePlaybackProgressOptions): UsePlaybackProgressReturn {
  const [currentTime, setCurrentTime] = useState(0);

  // Update current playback position every second
  useEffect(() => {
    if (!isPlaying || !startedAt) {
      return;
    }

    const startedAtMs = new Date(startedAt).getTime();

    const updateTime = () => {
      const elapsed = Date.now() - startedAtMs;
      setCurrentTime(Math.min(elapsed, durationMs));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMs, isPlaying]);

  // Trigger callback when song ends
  useEffect(() => {
    if (currentTime >= durationMs && durationMs > 0 && isPlaying) {
      onTrackEnd?.();
    }
  }, [currentTime, durationMs, isPlaying, onTrackEnd]);

  // Reset time when not playing
  const displayTime = isPlaying && startedAt ? currentTime : 0;
  const progressPercent = durationMs > 0 ? (displayTime / durationMs) * 100 : 0;

  return {
    currentTime: displayTime,
    progressPercent,
  };
}
