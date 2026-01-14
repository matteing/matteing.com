"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
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
          <Image
            src={album.hqCoverUrl}
            alt={album.name}
            className={styles.image}
            fill
          />

          {/* Animated video overlay (Apple Music motion artwork) */}
          {album.videoUrl && (
            <video
              src={album.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className={styles.video}
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
