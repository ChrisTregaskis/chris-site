import { PHYSIO_HEADING } from "./physioHeading";
import { RingsExplorer } from "./rings/RingsExplorer";
import { ChapterRail } from "@/ui/atoms/ChapterRail";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/**
 * Chapter 2: the physio and wellness platform, told as rings round its data
 * (`rings/RingsExplorer`): how it runs, ring by ring from the outside in,
 * with a journey to send through each ring.
 */
export function PhysioSection() {
  return (
    <Section
      id="physio"
      labelledBy="physio-title"
      tone={{ from: "wayfinder", to: "physio" }}
    >
      <ChapterRail numeral="2" total="3" />
      <ChapterHeading
        id="physio-title"
        numeral="2"
        title={PHYSIO_HEADING.title}
        lede={PHYSIO_HEADING.lede}
        chips={PHYSIO_HEADING.chips}
      />
      <RingsExplorer />
    </Section>
  );
}
