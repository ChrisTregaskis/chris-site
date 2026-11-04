import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { POSES } from "../burpeeSet";
import { FRAMES } from "../frames";
import { useSealBeat } from "../useSealBeat";
import { BurpeesLinks } from "./BurpeesLinks";
import { callAt, CALLS, repsAt, SET_REPS } from "./calls";
import { BURPEES_TITLE, CALLS_LEDE } from "./copy";
import { useFitNumeral } from "./useFitNumeral";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { cn } from "@/lib/cn";
import { stickyProgress } from "@/lib/scrollProgress";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/**
 * Direction C, called out. No phone: the set itself, set as type. The stage
 * pins while the section scrolls a set of 100, the count huge in the
 * chapter-numeral violet with the app's figure doing Navy SEALs in front of
 * it at the app's beat, and the story told in the app's own spoken calls,
 * each with one line: who it's for, how it's used, why low stakes let it
 * be built as an experiment, how it grew, what it doesn't track, and that
 * it's free. Reduced motion: a finished
 * set, one frame, every call and line listed, no pinning.
 */
/**
 * The count's type: the chapter numeral's, set as large as its column
 * allows. Joined as a plain string, not through `cn`: tailwind-merge would
 * drop the line height when a font size follows it.
 */
const NUMERAL =
  "font-display font-bold tabular-nums leading-[0.8] tracking-[-0.06em] text-accent-strong [font-variation-settings:'opsz'_96]";

export function DirectionC() {
  const still = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stickTop = useRef(0);
  const columnRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);
  useFitNumeral(columnRef, ghostRef, countRef);
  const [reps, setReps] = useState(still ? SET_REPS : 0);
  const [called, setCalled] = useState(still ? CALLS.length - 1 : 0);
  const { figureRef, pose } = useSealBeat(still);

  const onFrame = useCallback((resized: boolean) => {
    const run = runRef.current;
    const stage = stageRef.current;
    if (!run || !stage) return;
    if (resized) {
      stickTop.current = parseFloat(getComputedStyle(stage).top) || 0;
    }
    const rect = run.getBoundingClientRect();
    const progress = stickyProgress(
      rect.top,
      rect.height,
      window.innerHeight,
      stickTop.current,
    );
    setReps(repsAt(progress));
    setCalled(callAt(progress));
  }, []);
  useScrollFrame(onFrame, !still, sectionRef);

  const shownReps = still ? SET_REPS : reps;
  const shownCall = still ? CALLS.length - 1 : called;

  return (
    <div ref={sectionRef}>
      <Section
        id="burpees"
        labelledBy="burpees-title"
        tone={{ from: "physio", to: "burpees", feather: "70vh" }}
      >
        <ChapterHeading
          id="burpees-title"
          numeral="3"
          title={BURPEES_TITLE}
          lede={CALLS_LEDE}
        />
        <BurpeesLinks className="mt-3" />
        {/* The story, in order, for assistive tech; the stage is its picture. */}
        <VisuallyHidden>
          <ol>
            {CALLS.map((item) => (
              <li key={item.call}>
                {item.call} {item.line}
              </li>
            ))}
          </ol>
        </VisuallyHidden>
        <div ref={runRef} className={cn(!still && "h-[420vh]")}>
          <div
            ref={stageRef}
            aria-hidden="true"
            className={cn(
              "grid content-center gap-[clamp(16px,3vh,40px)] wide:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] wide:items-end",
              still
                ? "py-10"
                : "sticky top-nav h-[calc(100svh-var(--size-nav))]",
            )}
          >
            <div ref={columnRef} className="relative">
              <span
                ref={ghostRef}
                className={`${NUMERAL} pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap text-[100px]`}
              >
                {SET_REPS}
              </span>
              <p
                ref={countRef}
                className={`${NUMERAL} m-0 whitespace-nowrap text-[length:min(var(--fit,42vw),22svh)] wide:text-[length:min(var(--fit,24vw),46svh)]`}
              >
                {shownReps}
              </p>
              <p className="m-0 mt-3 text-body-sm text-muted">
                of {SET_REPS} Navy SEALs
              </p>
              <div
                ref={figureRef}
                className="absolute bottom-6 right-0 aspect-square w-[min(46%,26svh)] wide:w-[min(48%,44svh)]"
              >
                {POSES.map((name) => (
                  <img
                    key={name}
                    src={FRAMES[name]}
                    alt=""
                    width={512}
                    height={512}
                    decoding="async"
                    className={cn(
                      "absolute inset-0 size-full select-none object-contain object-bottom",
                      name === pose ? "opacity-100" : "opacity-0",
                    )}
                  />
                ))}
              </div>
            </div>
            <ol className="relative z-[1] m-0 list-none p-0 wide:pb-10">
              {CALLS.map((item, index) => {
                if (index > shownCall) return null;
                const now = index === shownCall;
                return (
                  <li
                    key={item.call}
                    className={cn(now || still ? "mt-3" : "hidden wide:block")}
                  >
                    <p
                      className={cn(
                        "m-0 font-display font-semibold leading-[1.05] tracking-[-0.02em]",
                        now
                          ? "text-[clamp(34px,4vw,56px)] text-signal"
                          : "text-[20px] text-muted",
                      )}
                    >
                      {item.call}
                    </p>
                    {now || still ? (
                      <p className="m-0 mt-2 max-w-[24em] text-ink wide:text-body-lg">
                        {item.line}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Section>
    </div>
  );
}
