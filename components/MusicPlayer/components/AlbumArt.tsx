"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArtworkImage } from "./ArtworkImage";
import type { Album } from "@/lib/apple-music/types";
import styles from "./AlbumArt.module.css";

interface AlbumArtProps {
  /** Album object with cover URLs and video */
  album: Album;
  /** Dominant color for the gradient blend */
  dominantColor?: string;
}

/**
 * Album artwork component with optional animated video overlay.
 * Includes a soft gradient on the right edge to blend into the track info area.
 */
export function AlbumArt({ album, dominantColor }: AlbumArtProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoKey = `${album.id}:${album.videoUrl ?? ""}`;
  const [videoState, setVideoState] = useState<{
    key: string;
    value: "loading" | "ready" | "error";
  }>({ key: videoKey, value: "loading" });
  const currentVideoState =
    videoState.key === videoKey ? videoState.value : "loading";

  // Nudge iOS Safari to autoplay inline motion artwork
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure attributes are set before play attempt (some iOS builds are picky)
    video.setAttribute("playsinline", "true");
    video.setAttribute("muted", "true");
    video.setAttribute("autoplay", "true");

    const playAttempt = video.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        // Ignore autoplay rejections; iOS may require a second attempt after user gesture
      });
    }
  }, [videoKey]);

  return (
    <a
      href={album.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.container}
    >
      {/* Static album cover with fade animation on change */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={album.id}
          className={styles.artwork}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ArtworkImage
            src={album.hqCoverUrl || album.coverUrl}
            alt={album.name}
            containerClassName={styles.imageFrame}
            imageClassName={styles.image}
            fallbackClassName={styles.imageFallback}
            fallback={<span aria-hidden="true">♫</span>}
            fill
            sizes="(max-width: 639px) 100vw, 312px"
          />

          {/* Animated video overlay (Apple Music motion artwork) */}
          {album.videoUrl && currentVideoState !== "error" && (
            <video
              key={album.videoUrl}
              ref={videoRef}
              src={album.videoUrl}
              autoPlay
              controls={false}
              loop
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              className={styles.video}
              data-video-state={currentVideoState}
              onCanPlay={() =>
                setVideoState({ key: videoKey, value: "ready" })
              }
              onError={() =>
                setVideoState({ key: videoKey, value: "error" })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Soft gradient to blend album art into the background */}
      <div
        className={styles.gradient}
        style={{
          background: dominantColor
            ? `linear-gradient(to right, transparent, ${dominantColor})`
            : undefined,
        }}
      />
    </a>
  );
}
