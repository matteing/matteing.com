import { Link } from "@/components/Link";
import { Section } from "@/components/Section";
import { TimelineGallery } from "@/components/TimelineGallery";
import type { ExperienceItem } from "@/data/types";
import styles from "./Timeline.module.css";

type TimelineProps = {
  title: string;
  items: ExperienceItem[];
};

export function Timeline({ title, items }: TimelineProps) {
  const id = `timeline-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Section id={id} title={title}>
      {items.map((item, index) => (
        <article key={index} className={styles.item}>
          <time className={styles.date}>{item.date}</time>
          <div>
            <h3 className={styles.itemTitle}>
              {item.url ? (
                <Link href={item.url} external>
                  {item.title}
                  {item.subtitle && ` at ${item.subtitle}`}
                </Link>
              ) : (
                <span className={styles.itemTitleLink}>
                  {item.title}
                  {item.subtitle && ` at ${item.subtitle}`}
                </span>
              )}
            </h3>
            {item.description && (
              <p className={styles.description}>{item.description}</p>
            )}
            {item.bullets && (
              <ul className={styles.list}>
                {item.bullets.map((bullet, i) => (
                  <li key={i} className={styles.listItem}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {item.images && item.images.length > 0 && (
              <TimelineGallery images={item.images} title={item.title} />
            )}
          </div>
        </article>
      ))}
    </Section>
  );
}
