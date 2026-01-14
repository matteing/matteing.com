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
  recentAlbums: Album[];
  /** ISO date string of when the current song started playing */
  startedAt: string | null;
  /** Internal metadata - not persisted to blob or sent to clients */
  _meta?: {
    /** Whether this fetch detected a track change from the previous state */
    trackChanged: boolean;
  };
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

/**
 * A mocked response used when authentication is unavailable.
 */
export interface MockedResponse {
  status: number;
  json: () => Promise<Record<string, never>>;
}

/**
 * Union type for the return value of getRecentTracks.
 */
export type RecentTracksResult = Response | MockedResponse;

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
 * Preview object from Apple Music API.
 */
export interface AppleMusicPreview {
  url: string;
  hlsUrl?: string;
}

/**
 * Track attributes from Apple Music API.
 */
export interface AppleMusicTrackAttributes {
  name: string;
  artistName: string;
  albumName: string;
  durationInMillis?: number;
  artwork: AppleMusicArtwork;
  editorialVideo?: AppleMusicEditorialVideo;
  previews?: AppleMusicPreview[];
  url: string;
}

/**
 * A track from the Apple Music API.
 */
export interface AppleMusicTrack {
  id: string;
  type: "songs";
  attributes: AppleMusicTrackAttributes;
  relationships?: {
    albums?: {
      data: AppleMusicAlbumReference[];
    };
  };
}

/**
 * Album reference in track relationships.
 */
export interface AppleMusicAlbumReference {
  id: string;
  type: "albums";
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

/**
 * Response from the recent tracks endpoint.
 */
export interface RecentTracksResponse {
  data: AppleMusicTrack[];
}

/**
 * Response from the catalog song endpoint.
 */
export interface CatalogSongResponse {
  data: AppleMusicTrack[];
}

/**
 * Response from the catalog album endpoint.
 */
export interface CatalogAlbumResponse {
  data: AppleMusicAlbum[];
}
