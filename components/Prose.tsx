import styles from "./Prose.module.css";

interface ProseProps {
  children?: React.ReactNode;
  html?: string;
}

export function Prose({ children, html }: ProseProps) {
  if (html) {
    return (
      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <div className={styles.prose}>{children}</div>;
}
