"use client";

import Image, { type ImageProps } from "next/image";
import type { CSSProperties, ReactNode, SyntheticEvent } from "react";
import { useState } from "react";
import styles from "./ArtworkImage.module.css";

type ImageState = "loading" | "loaded" | "error";

interface ArtworkImageProps
  extends Omit<
    ImageProps,
    "src" | "alt" | "className" | "onLoad" | "onError"
  > {
  src?: string | null;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallback?: ReactNode;
}

function classNames(...names: Array<string | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/**
 * Keeps a CSS fallback underneath remote music artwork and only reveals the
 * image after real pixels have decoded. Failed images are unmounted so the
 * browser's native broken-image UI is never exposed.
 */
export function ArtworkImage({
  src,
  alt,
  width,
  height,
  fill,
  containerClassName,
  imageClassName,
  fallbackClassName,
  fallback,
  ...imageProps
}: ArtworkImageProps) {
  const key = src?.trim() ?? "";
  const [state, setState] = useState<{ key: string; value: ImageState }>({
    key,
    value: key ? "loading" : "error",
  });
  const imageState: ImageState =
    state.key === key ? state.value : key ? "loading" : "error";

  const dimensions: CSSProperties | undefined =
    !fill && width && height
      ? {
          width: `${width}px`,
          aspectRatio: `${width} / ${height}`,
        }
      : undefined;

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setState({
      key,
      value: event.currentTarget.naturalWidth > 0 ? "loaded" : "error",
    });
  };

  return (
    <span
      className={classNames(styles.container, containerClassName)}
      style={dimensions}
      data-image-state={imageState}
    >
      <span
        className={classNames(styles.fallback, fallbackClassName)}
        role="img"
        aria-label={alt}
        aria-hidden={imageState === "loaded"}
      >
        {fallback ?? <span aria-hidden="true">♫</span>}
      </span>

      {key && imageState !== "error" && (
        <Image
          {...imageProps}
          key={key}
          src={key}
          alt={imageState === "loaded" ? alt : ""}
          aria-hidden={imageState !== "loaded"}
          width={width}
          height={height}
          fill={fill}
          className={classNames(styles.image, imageClassName)}
          onLoad={handleLoad}
          onError={() => setState({ key, value: "error" })}
          unoptimized
        />
      )}
    </span>
  );
}
