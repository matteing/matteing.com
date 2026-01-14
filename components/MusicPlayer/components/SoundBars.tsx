import styles from "./SoundBars.module.css";

/**
 * Animated sound bars indicator shown when music is playing.
 * Uses the `soundbar` keyframe animation defined in globals.css.
 */
export function SoundBars() {
  return (
    <div className={styles.container} title="🎵">
      <div className={styles.bars}>
        <span className={`${styles.bar} ${styles.bar1}`} />
        <span className={`${styles.bar} ${styles.bar2}`} />
        <span className={`${styles.bar} ${styles.bar3}`} />
      </div>
    </div>
  );
}
