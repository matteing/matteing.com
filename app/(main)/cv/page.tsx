import { Timeline } from "@/components/Timeline";
import { workItems, awards, education, contact } from "@/data/experience";

export const metadata = {
  title: "CV",
};

export default function CV() {
  return (
    <>
      <Timeline title="Work Experience" items={workItems} />
      <Timeline title="Other" items={awards} />
      <Timeline title="Education" items={education} />
      <Timeline title="Contact" items={contact} />
    </>
  );
}
