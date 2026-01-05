import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Timeline } from "@/components/experience/Timeline";
import { workItems, awards, education, contact } from "@/data/experience";

export default function Home() {
  return (
    <main className="container">
      <section className="mb-12" aria-label="Profile">
        <Header />
      </section>

      <section className="mb-7" aria-label="Navigation">
        <Navigation />
      </section>

      <section className="mb-13" aria-label="Introduction">
        <p className="text-text-secondary">
          I'm a 1×-exit engineer passionate about building delightful user
          experiences.
        </p>
      </section>

      <Timeline title="Work Experience" items={workItems} />
      <Timeline title="Other" items={awards} />
      <Timeline title="Education" items={education} />
      <Timeline title="Contact" items={contact} />

      <Footer />
    </main>
  );
}
