import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/**
 * Standard homepage section with consistent spacing and heading styles.
 */
export function Section({ id, title, children }: SectionProps) {
  return (
    <section className="mb-12" aria-labelledby={id}>
      <h2
        className="mb-6 flex items-center gap-2 font-semibold"
        id={id}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
