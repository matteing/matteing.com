"use client";

import Image from "next/image";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import styles from "./Timeline.module.css";

interface TimelineGalleryProps {
  images: string[];
  title: string;
}

export function TimelineGallery({ images, title }: TimelineGalleryProps) {
  return (
    <LightGallery
      elementClassNames={styles.gallery}
      speed={300}
      download={false}
    >
      {images.map((src, i) => (
        <a
          key={i}
          href={src}
          className={styles.galleryLink}
          aria-label={`View ${title} image ${i + 1}`}
        >
          <Image
            src={src}
            alt={`${title} screenshot ${i + 1}`}
            className={styles.galleryImage}
            width={200}
            height={150}
          />
        </a>
      ))}
    </LightGallery>
  );
}
