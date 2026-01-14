interface LocaleDateProps {
  date: string;
  className?: string;
}

/**
 * Renders a date in a consistent locale format (e.g., "January 10, 2026").
 * Wraps the date in a <time> element with the proper datetime attribute.
 */
export function LocaleDate({ date, className }: LocaleDateProps) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <time dateTime={date} className={className}>
      {formatted}
    </time>
  );
}
