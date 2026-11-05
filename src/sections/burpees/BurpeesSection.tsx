import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, useRef } from "react";
import { BurpeesLinks } from "./BurpeesLinks";
import { BURPEES_HEADING } from "./burpeesHeading";
import { CALLS } from "./calls";
import { RUN_HEIGHT } from "./stageRun";
import { useStageReady } from "./useStageReady";
import { cn } from "@/lib/cn";
import { ChapterRail } from "@/ui/atoms/ChapterRail";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/*
 * The set is its own chunk, fetched after the page's first paint and drawn
 * as the visitor nears it (see useStageReady); until then its run keeps its
 * exact height, so nothing moves when it arrives.
 */
const loadCalledSet = () => import("./CalledSet");
const CalledSet = lazy(() =>
  loadCalledSet().then((m) => ({ default: m.CalledSet })),
);

/**
 * Chapter 3: Badass Burpees, Chris's own app, told in its own spoken calls
 * as the visitor scrolls through a set of 100 (see `CalledSet`). The calls
 * are also listed, in order, for assistive tech: the set is their picture.
 */
export function BurpeesSection() {
  const still = useReducedMotion() ?? false;
  const roomRef = useRef<HTMLDivElement>(null);
  const ready = useStageReady(roomRef, loadCalledSet, still);
  const room = <div className={cn(!still && RUN_HEIGHT)} />;

  return (
    <Section
      id="burpees"
      labelledBy="burpees-title"
      tone={{ from: "physio", to: "burpees", feather: "70vh" }}
    >
      <ChapterRail numeral="3" total="3" />
      <ChapterHeading
        id="burpees-title"
        numeral="3"
        title={BURPEES_HEADING.title}
        lede={BURPEES_HEADING.lede}
      />
      <BurpeesLinks className="mt-3" />
      <ol className="sr-only">
        {CALLS.map((item) => (
          <li key={item.call}>
            {item.call} {item.line}
          </li>
        ))}
      </ol>
      <div ref={roomRef}>
        {ready ? (
          <Suspense fallback={room}>
            <CalledSet still={still} />
          </Suspense>
        ) : (
          room
        )}
      </div>
    </Section>
  );
}
