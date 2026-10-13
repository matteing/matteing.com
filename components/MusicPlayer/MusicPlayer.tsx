"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { motion } from "motion/react";
import type {
	NowPlayingState,
	RecentlyPlayedState,
	VideoUrls,
} from "@/lib/apple-music/types";
import {
	POLL_INTERVAL_MS,
	RECENT_FRESH_MS,
	RECENT_MAX_AGE_MS,
} from "@/lib/apple-music/shared.mjs";
import { SoundBars } from "./components/SoundBars";
import { AlbumArt } from "./components/AlbumArt";
import { TrackInfo } from "./components/TrackInfo";
import {
	RecentlyPlayed,
	RecentlyPlayedExpanded,
} from "./components/RecentlyPlayed";
import {
	usePlaybackProgress,
	type TimedResponse,
} from "./hooks/usePlaybackProgress";
import { shouldUseLightText, darkenColor } from "./utils/colors";

async function fetchJSON<T>(url: string): Promise<T> {
	const response = await fetch(url, {
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});
	if (!response.ok)
		throw new Error(`Music request failed (${response.status})`);
	return response.json();
}

async function fetchTimed<T>(url: string): Promise<TimedResponse<T>> {
	// Include request time conservatively so slow responses cannot extend a lease.
	const requestedAt = performance.now();
	const requestedWallTime = Date.now();
	const value = await fetchJSON<T>(url);
	return { value, requestedAt, requestedWallTime };
}

export default function MusicPlayer() {
	const playback = useSWR("/api/now-playing", fetchTimed<NowPlayingState>, {
		refreshInterval: 5000,
		dedupingInterval: 1000,
		errorRetryInterval: 5000,
	});
	const history = useSWR(
		"/api/recently-played",
		fetchTimed<RecentlyPlayedState>,
		{
			refreshInterval: POLL_INTERVAL_MS,
			dedupingInterval: 1000,
			errorRetryInterval: 15_000,
		},
	);
	const { isPlaying, currentTime, elapsedSince } = usePlaybackProgress(
		playback.data,
	);
	const track = isPlaying ? playback.data?.value.track : null;
	const albumId = track?.album.id;
	// Motion artwork is optional: its request can never delay playback or history.
	const { data: video } = useSWR(
		albumId && /^\d+$/.test(albumId)
			? `/api/music/artwork?albumId=${albumId}`
			: null,
		fetchJSON<VideoUrls>,
		{
			dedupingInterval: 3_600_000,
			revalidateOnFocus: false,
			shouldRetryOnError: false,
		},
	);
	const dominantColor = track?.dominantColor;
	const { darkerColor, textColor } = useMemo(
		() => ({
			darkerColor: darkenColor(dominantColor ?? null, 25),
			textColor: shouldUseLightText(dominantColor ?? null)
				? "#ffffff"
				: "#1a1a1a",
		}),
		[dominantColor],
	);

	const recent = history.data?.value;
	const recentAge =
		recent?.fetchedAt != null
			? recent.serverTime - recent.fetchedAt + elapsedSince(history.data!)
			: Infinity;
	const recentUsable =
		!!recent && !recent.unavailable && recentAge < RECENT_MAX_AGE_MS;
	const albums = recentUsable ? recent.albums : [];
	const recentStale =
		recentUsable && (recent.stale || recentAge >= RECENT_FRESH_MS);
	const recentStatus =
		!history.data && !history.error
			? "Fetching some tunes..."
			: !recentUsable
				? "Recent listening is temporarily unavailable."
				: "No recently played music yet.";

	return (
		<motion.div
			layout
			className="overflow-hidden rounded-xl"
			style={{ minHeight: 330 }}
			transition={{
				layout: {
					type: "spring",
					stiffness: 260,
					damping: 32,
					mass: 0.8,
				},
			}}
		>
			{track ? (
				<div
					className="relative overflow-hidden rounded-lg"
					style={{
						backgroundColor: dominantColor || "#1f2937",
						color: textColor,
					}}
				>
					<div className="relative flex flex-col sm:flex-row">
						<SoundBars />
						<AlbumArt
							album={{
								...track.album,
								videoUrl: video?.standard ?? null,
								hqVideoUrl: video?.hq ?? null,
							}}
							dominantColor={dominantColor ?? undefined}
						/>
						<TrackInfo
							name={track.name}
							artist={track.artist}
							url={track.url}
							currentTime={currentTime}
							duration={track.durationMs}
						/>
					</div>
					{albums.length > 0 && (
						<RecentlyPlayed
							albums={albums.filter(
								(album) => album.id !== track.album.id,
							)}
							maxItems={4}
							backgroundColor={darkerColor}
							textColor={textColor}
						/>
					)}
				</div>
			) : albums.length > 0 ? (
				<RecentlyPlayedExpanded albums={albums} />
			) : (
				<div
					className="flex min-h-[330px] items-center justify-center rounded-lg bg-gray-100 p-4 text-sm text-gray-500 sm:p-5"
					role="status"
				>
					{recentStatus}
				</div>
			)}
			{recentStale && (
				<p className="px-4 py-2 text-xs text-gray-500" role="status">
					Recently played is temporarily out of date.
				</p>
			)}
		</motion.div>
	);
}
