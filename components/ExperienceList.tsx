"use client";

import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";

export type ExperienceItem = {
  date: string;
  title: string;
  subtitle?: string;
  url?: string;
  description?: string;
  bullets?: string[];
  images?: string[];
};

type ExperienceListProps = {
  title: string;
  items: ExperienceItem[];
};

export default function ExperienceList({ title, items }: ExperienceListProps) {
  return (
    <section className="timeline-section">
      <h3 className="font-semibold mb-6">{title}</h3>
      {items.map((item, index) => (
        <article key={index} className="timeline-item">
          <div className="timeline-date">{item.date}</div>
          <div className="timeline-content">
            <h3 className="timeline-title text-text-primary font-semibold">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-outbound"
                >
                  {item.title}
                  {item.subtitle && ` at ${item.subtitle}`}
                </a>
              ) : (
                <>
                  {item.title}
                  {item.subtitle && ` at ${item.subtitle}`}
                </>
              )}
            </h3>
            {item.description && (
              <p className="timeline-description">{item.description}</p>
            )}
            {item.bullets && (
              <ul className="timeline-list">
                {item.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
            {item.images && item.images.length > 0 && (
              <LightGallery
                elementClassNames="timeline-gallery"
                speed={300}
                download={false}
              >
                {item.images.map((src, i) => (
                  <a key={i} href={src} aria-label={`${item.title} image ${i + 1}`}>
                    <img src={src} alt={`${item.title} ${i + 1}`} />
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
