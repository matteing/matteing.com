"use client";

import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import { Link } from "@/components/ui/Link";
import type { ExperienceItem } from "@/data/types";
import styles from "./Timeline.module.css";

type TimelineProps = {
  title: string;
  items: ExperienceItem[];
};

export function Timeline({ title, items }: TimelineProps) {
  return (
    <section className={styles.section} aria-labelledby={`timeline-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2 className={styles.title} id={`timeline-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        {title}
      </h2>
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
                  <li key={i} className={styles.listItem}>{bullet}</li>
                ))}
              </ul>
            )}
            {item.images && item.images.length > 0 && (
              <LightGallery
                elementClassNames={styles.gallery}
                speed={300}
                download={false}
              >
                {item.images.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    className={styles.galleryLink}
                    aria-label={`View ${item.title} image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${item.title} screenshot ${i + 1}`}
                      className={styles.galleryImage}
                    />
                  </a>
                ))}
              </LightGallery>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
