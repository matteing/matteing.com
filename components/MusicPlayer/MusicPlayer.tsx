"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { motion } from "motion/react";
import { Section } from "@/components/Section";
import { catalogId } from "@/lib/apple-music/normalize";
import type {
	NowPlayingState,
	RecentlyPlayedState,
	ArtworkDetails,
} from "@/lib/apple-music/types";
import {
	POLL_INTERVAL_MS,
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
	const albumId = catalogId(track?.album.id);
	const coverUrl = track?.album.hqCoverUrl || track?.album.coverUrl;
	const artworkParams = new URLSearchParams();
	if (albumId) artworkParams.set("albumId", albumId);
	else if (track?.catalogSongId)
		artworkParams.set("songId", track.catalogSongId);
	if (coverUrl) artworkParams.set("coverUrl", coverUrl);
	// Colors and motion artwork load independently of playback and history.
	const { data: artwork } = useSWR(
		artworkParams.size ? `/api/music/artwork?${artworkParams}` : null,
		fetchJSON<ArtworkDetails>,
		{
			dedupingInterval: 10_000,
			refreshInterval: (data) => (data?.retryable ? 30_000 : 0),
			revalidateOnFocus: false,
			errorRetryInterval: 15_000,
			errorRetryCount: 3,
		},
	);
	const dominantColor = artwork?.dominantColor ?? track?.dominantColor;
	const backgroundColor = dominantColor || "var(--color-white)";
	const { darkerColor, textColor } = useMemo(
		() => ({
			darkerColor: darkenColor(dominantColor ?? null, 25),
			textColor: dominantColor
				? shouldUseLightText(dominantColor)
					? "#ffffff"
					: "#1a1a1a"
				: "var(--color-text-primary)",
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
	if (!track && albums.length === 0) return null;

	return (
		<Section id="now-playing" title="Apple Music">
			<motion.div
				layout
				className="overflow-hidden rounded-xl"
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
							backgroundColor,
							color: textColor,
						}}
					>
						<div className="relative flex flex-col sm:flex-row">
							<SoundBars />
							<AlbumArt
								album={{
									...track.album,
									videoUrl: artwork?.standard ?? null,
									hqVideoUrl: artwork?.hq ?? null,
								}}
								dominantColor={backgroundColor}
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
				) : (
					<RecentlyPlayedExpanded albums={albums} />
				)}
			</motion.div>
		</Section>
	);
}
