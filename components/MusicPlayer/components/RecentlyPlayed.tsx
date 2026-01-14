import Image from "next/image";
import styles from "./RecentlyPlayed.module.css";

interface Album {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  url: string;
}

interface RecentlyPlayedProps {
  /** List of recently played albums */
  albums: Album[];
  /** Maximum number of albums to display */
  maxItems?: number;
  /** Background color (darkened dominant color) */
  backgroundColor?: string | null;
  /** Text color based on background luminance */
  textColor: string;
}

/**
 * Grid of recently played albums shown below the current track.
 */
export function RecentlyPlayed({
  albums,
  maxItems = 4,
  backgroundColor,
  textColor,
}: RecentlyPlayedProps) {
  if (!albums || albums.length === 0) return null;

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: backgroundColor || undefined, color: textColor }}
    >
      <h4 className={styles.title}>Recently played</h4>
      <div className={styles.grid}>
        {albums.slice(0, maxItems).map((album) => (
          <a
            key={album.id}
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.albumItem}
          >
            <Image
              src={album.coverUrl}
              alt={album.name}
              width={48}
              height={48}
              className={styles.albumCover}
            />
            <div className={styles.albumInfo}>
              <p className={styles.albumName}>{album.name}</p>
              <p className={styles.albumArtist}>{album.artist}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Expanded recently played grid shown when no track is currently playing.
 */
export function RecentlyPlayedExpanded({ albums }: { albums: Album[] }) {
  if (!albums || albums.length === 0) return null;

  return (
    <div className={styles.containerExpanded}>
      <h4 className={styles.title}>Recently played</h4>
      <div className={styles.grid}>
        {albums.slice(0, 6).map((album) => (
          <a
            key={album.id}
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.albumItem}
          >
            <Image
              src={album.coverUrl}
              alt={album.name}
              width={48}
              height={48}
              className={styles.albumCover}
            />
            <div className={styles.albumInfo}>
              <p className={styles.albumName}>{album.name}</p>
              <p className={styles.albumArtist}>{album.artist}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
