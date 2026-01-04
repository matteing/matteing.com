import SiteHeader from "@/components/SiteHeader";
import SiteNavigation from "@/components/SiteNavigation";
import ExperienceList from "@/components/ExperienceList";
import { workItems, awards, education, contact } from "@/data/experience";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="container">
      <section className="mb-12">
        <SiteHeader />
      </section>
      <section className="mb-7">
        <SiteNavigation />
      </section>
      <section className="mb-13">
        <p className="text-text-secondary">
          I’m a 1×-exit engineer passionate about building delightful user
          experiences.
        </p>
      </section>
      <ExperienceList title="Work Experience" items={workItems} />
      <ExperienceList title="Other" items={awards} />
      <ExperienceList title="Education" items={education} />
      <ExperienceList title="Contact" items={contact} />
      <Footer />
    </main>
  );
}
