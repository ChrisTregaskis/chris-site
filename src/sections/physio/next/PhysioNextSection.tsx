import { lazy, Suspense } from "react";
import { PHYSIO_HEADING } from "../physioHeading";
import { ChapterRail } from "@/ui/atoms/ChapterRail";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/*
 * The explorer is its own chunk, fetched only on this draft, so the live
 * chapter's bundle is what it was. Until it arrives its room is kept, about
 * a screen tall, so the anchor and the heading are there at once.
 */
const RingsExplorer = lazy(() =>
  import("./rings/RingsExplorer").then((m) => ({ default: m.RingsExplorer })),
);

/**
 * Chapter 2, next draft (`?physio=next`): the same opener as the live
 * chapter (heading, lede and chips unchanged), then the rings explorer in
 * place of the sessions table, its query and the leak test.
 */
export function PhysioNextSection() {
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
      <Suspense
        fallback={<div aria-hidden="true" className="min-h-[100svh]" />}
      >
        <RingsExplorer />
      </Suspense>
    </Section>
  );
}
