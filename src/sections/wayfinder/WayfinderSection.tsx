import { BuildStory } from "./BuildStory";
import { Wayfinder } from "@/features/wayfinder";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/** Chapter 1: Wayfinder, the AI guide, told part by part. */
export function WayfinderSection() {
  return (
    <Section id="work" labelledBy="wayfinder-title">
      <ChapterHeading
        id="wayfinder-title"
        title="Wayfinder, an AI guide for a global automotive brand"
        lede="A chat assistant live in production, guiding buyers on electric and hybrid options across the range. Test-drive booking and finance were proven in the prototype and demoed live. I built all of it on my own, from a reusable white-label foundation."
        chips={["React", "Node", "Multi-agent", "MCP", "Terraform"]}
      />
      <Wayfinder />
      <BuildStory />
    </Section>
  );
}
