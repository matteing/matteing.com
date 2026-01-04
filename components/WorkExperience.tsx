type WorkItem = {
  date: string;
  title: string;
  company: string;
  url: string;
  description: string;
  bullets?: string[];
};

const workItems: WorkItem[] = [
  {
    date: "2024 — Now",
    title: "Software Engineer",
    company: "Microsoft",
    url: "https://microsoft.com/",
    description:
      "Crafting cutting-edge UI/UX at Azure Monitor and improving team velocity through fast, modern tooling.",
    bullets: [
      "Delivery of multiple high-impact features",
      "Building and revitalizing internal UI libraries",
      "Upstream contributions to Chromium"
    ],
  },
  {
    date: "2022 — 2024",
    title: "Freelance Full-Stack Product Engineering",
    company: "",
    url: "https://matteing.com/",
    description:
      "Design, development and strategy for startups looking to quickly take ideas to market.",
  },
  {
    date: "2018 — 2021",
    title: "Founder",
    company: "Makerlog",
    url: "https://getmakerlog.com/",
    description:
      "Built a community platform called Makerlog, serving thousands of indie creators around the world.",
    bullets: [
      "Built and managed a worldwide community of over 10k members",
      "Meetups around the globe",
      "Built up to 500k+ monthly social media impressions",
    ],
  },
  {
    date: "2018 — 2021",
    title: "Founder",
    company: "Cowork",
    url: "https://getmakerlog.com/",
    description:
      "Founded Cowork, the virtual coworking space for modern remote teams. Launched right before the pandemic, we should've waited :P",
  },
  {
    date: "2017 — 2018",
    title: "Founder",
    company: "Taleship",
    url: "https://taleship.me/",
    description:
      "Founded Taleship at 17 years old: a community connecting writers around the world through turn-based gameplay. Competed in Microsoft Imagine Cup, a prestigious student developer competition.",
  },
];

export default function WorkExperience() {
  return (
    <section className="timeline-section">
      <h3 className="font-semibold mb-5">Work Experience</h3>
      {workItems.map((item, index) => (
        <article key={index} className="timeline-item">
          <div className="timeline-date">{item.date}</div>
          <div className="timeline-content">
            <h3 className="timeline-title text-text-primary font-semibold">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
                {item.company && ` at ${item.company}`}
              </a>
            </h3>
            <p className="timeline-description">{item.description}</p>
            {item.bullets && (
              <ul className="timeline-list">
                {item.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
