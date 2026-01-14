import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** Current playback time in milliseconds */
  currentTime: number;
  /** Total track duration in milliseconds */
  duration: number;
}

/**
 * Format milliseconds as mm:ss string.
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Playback progress bar with current time and duration display.
 */
export function ProgressBar({ currentTime, duration }: ProgressBarProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.container}>
      {/* Progress track */}
      <div className={styles.track}>
        <div
          className={styles.progress}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Time labels */}
      <div className={styles.times}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
