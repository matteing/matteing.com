import { Description } from "@/components/ui/Description";
import { Timeline } from "@/components/experience/Timeline";
import { workItems, awards, education, contact } from "@/data/experience";

export default function Home() {
  return (
    <>
      <Description>
        I'm a 1×-exit engineer passionate about building delightful user
        experiences.
      </Description>

      <Timeline title="Work Experience" items={workItems} />
      <Timeline title="Other" items={awards} />
      <Timeline title="Education" items={education} />
      <Timeline title="Contact" items={contact} />
    </>
  );
}
