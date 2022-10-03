import useSWR from "swr";
import { NowPlayingResponse, TopTracksResponse } from "../types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNowPlaying() {
	return useSWR<NowPlayingResponse>("/api/getNowPlaying", fetcher, {
		refreshInterval: 5000,
	});
}

export function useTopTracks() {
	return useSWR<TopTracksResponse>("/api/getTopTracks", fetcher);
}
