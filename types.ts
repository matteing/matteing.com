export interface NowPlayingResponse extends Track {
	isPlaying: boolean;
}

export interface TopTracksResponse {
	tracks: Track[];
}

export interface Track {
	artist: string;
	songUrl: string;
	title: string;
	albumImageUrl: string;
	blurAlbumImageUrl: string;
}
