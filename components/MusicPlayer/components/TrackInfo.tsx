import { ProgressBar } from "./ProgressBar";
import styles from "./TrackInfo.module.css";

interface TrackInfoProps {
	/** Track name */
	name: string;
	/** Artist name */
	artist: string;
	/** Apple Music URL */
	url: string;
	/** Current playback time in milliseconds */
	currentTime: number;
	/** Total track duration in milliseconds */
	duration: number;
}

/**
 * Track information display with name, artist, and progress bar.
 */
export function TrackInfo({
	name,
	artist,
	url,
	currentTime,
	duration,
}: TrackInfoProps) {
	return (
		<div className={styles.container}>
			<a
				href={url || undefined}
				target="_blank"
				rel="noopener noreferrer"
				className={styles.content}
			>
				<h3 className={styles.name}>{name}</h3>
				<p className={styles.artist}>{artist}</p>
			</a>
			<p
				className="mt-2 text-center text-xs opacity-70"
				title="Estimated from Apple Music history. Pauses, seeks, and repeated plays cannot be detected."
			>
				Estimated playback
			</p>
			{duration > 0 && (
				<ProgressBar currentTime={currentTime} duration={duration} />
			)}
		</div>
	);
}
