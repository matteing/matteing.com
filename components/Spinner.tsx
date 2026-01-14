/**
 * Gradient spinner component with size variants
 */

import styles from "./Spinner.module.css";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 10,
  md: 16,
  lg: 24,
};

export function Spinner({ size = "sm", className = "" }: SpinnerProps) {
  const pixels = sizeMap[size];
  
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ width: pixels, height: pixels }}
    >
      <div className={styles.ring}>
        <div className={styles.cap} />
        <div className={styles.hole} />
      </div>
    </div>
  );
}
