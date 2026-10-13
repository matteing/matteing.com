"use client";

import { useEffect, useState } from "react";
import type { NowPlayingState } from "@/lib/apple-music/types";
import { getPlaybackPosition } from "@/lib/apple-music/playback.mjs";

export interface TimedResponse<T> {
	value: T;
	requestedAt: number;
	requestedWallTime: number;
}

/** Local time measures the request's age; server time anchors the estimate. */
export function usePlaybackProgress(data?: TimedResponse<NowPlayingState>) {
	const [tick, setTick] = useState({ monotonic: 0, wall: 0 });
	useEffect(() => {
		const timer = setInterval(
			() => setTick({ monotonic: performance.now(), wall: Date.now() }),
			500,
		);
		return () => clearInterval(timer);
	}, []);
	const elapsedSince = (response: TimedResponse<unknown>) =>
		Math.max(
			0,
			tick.monotonic - response.requestedAt,
			tick.wall - response.requestedWallTime,
		);
	const elapsed = data ? elapsedSince(data) : 0;
	return {
		...(data
			? getPlaybackPosition(data.value, elapsed)
			: { isPlaying: false, currentTime: 0, progressPercent: 0 }),
		elapsedSince,
	};
}
