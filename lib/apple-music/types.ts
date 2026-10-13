/**
 * Types for Apple Music API integration
 */

// =============================================================================
// Base Entity Types
// =============================================================================

/**
 * Base entity that all Apple Music items share.
 */
export interface Entity {
	id: string;
	name: string;
	url: string;
}

// =============================================================================
// Display Types (transformed for frontend consumption)
// =============================================================================

/**
 * Album data formatted for display.
 */
export interface Album extends Entity {
	artist: string;
	coverUrl: string;
	hqCoverUrl: string;
	videoUrl: string | null;
	hqVideoUrl: string | null;
	previewUrl: string | null;
}

/**
 * Track data formatted for display.
 */
export interface Track extends Entity {
	artist: string;
	album: Album;
	blurDataUrl: string;
	previewUrl: string | null;
	dominantColor: string | null;
	durationMs: number;
}

/**
 * Now playing state returned by the API.
 */
export interface NowPlayingState {
	track: Track | null;
	isPlaying: boolean;
	/** Inferred from history detection, never an actual playback timestamp. */
	estimatedStartedAt: number | null;
	expiresAt: number | null;
	serverTime: number;
}

export interface RecentlyPlayedState {
	albums: Album[];
	fetchedAt: number | null;
	stale: boolean;
	unavailable: boolean;
	serverTime: number;
}

// =============================================================================
// Internal/Utility Types
// =============================================================================

/**
 * Video URLs at different quality levels for animated artwork display.
 */
export interface VideoUrls {
	/** Standard quality (~480-640px) - suitable for thumbnails and small displays */
	standard: string | null;
	/** High quality (highest available) - suitable for expanded/fullscreen views */
	hq: string | null;
}

/**
 * Stream information parsed from an HLS master playlist.
 */
export interface HLSStream {
	/** Bandwidth in bits per second */
	bandwidth: number;
	/** Resolution string (e.g., "1280x720") */
	resolution?: string;
	/** Width in pixels */
	width?: number;
	/** URL to the media playlist */
	url: string;
}

// =============================================================================
// Raw Apple Music API Types
// =============================================================================

/**
 * Editorial video data from Apple Music API.
 */
export interface AppleMusicEditorialVideo {
	motionSquareVideo1x1?: {
		video: string;
	};
	motionDetailSquare?: {
		video: string;
	};
}

/**
 * Artwork data from Apple Music API.
 */
export interface AppleMusicArtwork {
	url: string;
	width?: number;
	height?: number;
	bgColor?: string;
	textColor1?: string;
	textColor2?: string;
	textColor3?: string;
	textColor4?: string;
}

/**
 * Album attributes from Apple Music API.
 */
export interface AppleMusicAlbumAttributes {
	name: string;
	artistName: string;
	artwork: AppleMusicArtwork;
	editorialVideo?: AppleMusicEditorialVideo;
	url: string;
}

/**
 * An album from the Apple Music API.
 */
export interface AppleMusicAlbum {
	id: string;
	type: "albums";
	attributes: AppleMusicAlbumAttributes;
}
