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
/**
 * This draft's chips: the live chapter's own stay as they are (the title
 * and lede are shared, word for word).
 */
export const NEXT_CHIPS = [
  "React",
  "Postgres RLS",
  "Private network",
  "Job queue",
  "SST",
  "Turborepo",
];

const RingsExplorer = lazy(() =>
  import("./rings/RingsExplorer").then((m) => ({ default: m.RingsExplorer })),
);

/**
 * Chapter 2, next draft (`?physio=next`): the live chapter's title and lede,
 * its own chips, then the rings explorer in place of the sessions table, its
 * query and the leak test.
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
        chips={NEXT_CHIPS}
      />
      <Suspense
        fallback={<div aria-hidden="true" className="min-h-[100svh]" />}
      >
        <RingsExplorer />
      </Suspense>
    </Section>
  );
}
