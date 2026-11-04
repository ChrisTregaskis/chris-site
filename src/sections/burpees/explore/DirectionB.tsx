import { useReducedMotion } from "framer-motion";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { applyView } from "./applyView";
import { BurpeesLinks } from "./BurpeesLinks";
import { BURPEES_TITLE, PACING_LEDE } from "./copy";
import {
  BURPEES,
  type BurpeeId,
  clock,
  MAX_MINUTES,
  MIN_MINUTES,
  MIN_REPS,
  MINUTES_STEP,
  mostReps,
  fittedShape,
  readout,
  REPS_STEP,
  seconds,
  viewAt,
  views,
  zoomLevel,
} from "./pacing";
import { Ribbon } from "./Ribbon";
import { SentenceStepper } from "./SentenceStepper";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { cn } from "@/lib/cn";
import { stickyProgress } from "@/lib/scrollProgress";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/**
 * Direction B, the pacing engine. The app's real job, turning reps and a
 * window into a planned session, drawn as one bar of every rep's slot in the
 * app's own work, rest and count-in colours. The stage pins while the
 * section scrolls, and the scroll zooms in on a log scale through three
 * levels: the session, one rep's slot (work, rest, the count-in's seconds),
 * and the rep itself (its beats, drawn and counted). The numbers in the
 * sentence above it are steppers: change them and the bar re-packs, the
 * readout rewritten. Reduced motion: the three levels drawn one under the
 * other, no pinning.
 */
export function DirectionB() {
  const still = useReducedMotion() ?? false;
  const [burpee, setBurpee] = useState<BurpeeId>("six-count");
  const [reps, setReps] = useState(100);
  const [minutes, setMinutes] = useState(20);
  const most = mostReps(burpee, minutes);
  const shown = Math.min(reps, most);
  const shape = useMemo(
    () => fittedShape(burpee, shown, minutes),
    [burpee, shown, minutes],
  );
  const all = useMemo(() => views(shape), [shape]);
  const [level, setLevel] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const stickTop = useRef(0);

  const onFrame = useCallback(
    (resized: boolean) => {
      const run = runRef.current;
      const stage = stageRef.current;
      const ribbon = ribbonRef.current;
      if (!run || !stage || !ribbon) return;
      if (resized) {
        stickTop.current = parseFloat(getComputedStyle(stage).top) || 0;
      }
      const rect = run.getBoundingClientRect();
      const zoom = zoomLevel(
        stickyProgress(
          rect.top,
          rect.height,
          window.innerHeight,
          stickTop.current,
        ),
      );
      applyView(ribbon, viewAt(zoom, all), zoom);
      setLevel(Math.round(zoom));
    },
    [all],
  );
  useScrollFrame(onFrame, !still, sectionRef);
  // A new session re-packs the bar: put it back at the scroll's view at once.
  useLayoutEffect(() => {
    if (!still) onFrame(true);
  }, [onFrame, still]);

  const other: BurpeeId = burpee === "six-count" ? "navy-seal" : "six-count";
  const plural = burpee === "six-count" ? "six-counts" : "Navy SEALs";
  const scales = [
    {
      title: "The whole session",
      text: `${shown} reps spread evenly through ${minutes} minutes, every moment of it planned before you start. It ends on the last rep, at ${clock(shape.totalMs)}.`,
    },
    {
      title: "One rep's slot",
      text: `Every rep gets the same ${seconds(shape.intervalMs)}: the work, then rest, then a count-in of whole seconds into the next, up to five. Any spare part of a second goes to the rest, so the count always lands on the second.`,
    },
    {
      title: "One rep",
      text: `Positions on a beat: the set on your hips held for ${seconds(shape.setBeatMs)}, then 0.8s a move, the count landing on each.`,
    },
  ];

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
          lede={PACING_LEDE}
        />
        <BurpeesLinks className="mt-3" />
        <div ref={runRef} className={cn(!still && "h-[360vh]")}>
          <div
            ref={stageRef}
            className={cn(
              "flex flex-col justify-center gap-[clamp(14px,2.4vh,28px)]",
              still
                ? "py-10"
                : "sticky top-nav h-[calc(100svh-var(--size-nav))]",
            )}
          >
            <div>
              <p className="m-0 font-display text-[clamp(26px,3.2vw,44px)] font-semibold leading-[1.15] tracking-[-0.02em]">
                <SentenceStepper
                  value={shown}
                  unit="reps"
                  step={REPS_STEP}
                  min={MIN_REPS}
                  max={most}
                  onChange={setReps}
                />{" "}
                <button
                  type="button"
                  onClick={() => setBurpee(other)}
                  aria-label={`${BURPEES[burpee].label}. Switch to ${BURPEES[other].label}`}
                  className="border-0 bg-transparent p-0 font-display font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent"
                >
                  {plural}
                </button>{" "}
                in{" "}
                <SentenceStepper
                  value={minutes}
                  unit="minutes"
                  step={MINUTES_STEP}
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  onChange={setMinutes}
                />{" "}
                minutes
              </p>
              <p
                aria-live="polite"
                className="m-0 mt-2 max-w-[44em] text-muted wide:text-body-lg"
              >
                {readout(shape)}
                {shown === most
                  ? " That's the most that fit at 0.8s a move."
                  : ""}
              </p>
            </div>
            {still ? (
              scales.map((scale, index) => (
                <div key={scale.title}>
                  <Ribbon
                    shape={shape}
                    burpee={burpee}
                    fixed={{ view: all[index], level: index }}
                  />
                  <h3 className="m-0 mt-2 font-display text-[22px] font-semibold">
                    {scale.title}
                  </h3>
                  <p className="m-0 mt-1 max-w-[36em] text-muted">
                    {scale.text}
                  </p>
                </div>
              ))
            ) : (
              <>
                <Ribbon shape={shape} burpee={burpee} rootRef={ribbonRef} />
                <ol className="m-0 grid list-none gap-6 p-0 wide:grid-cols-3">
                  {scales.map((scale, index) => {
                    const on = level === index;
                    return (
                      <li
                        key={scale.title}
                        className={cn(
                          "tone-ease",
                          on ? "block" : "hidden wide:block wide:tone-dim",
                        )}
                      >
                        <span className={stepNumeralClasses(on, "text-[40px]")}>
                          {index + 1}
                        </span>
                        <h3 className="m-0 mb-2 font-display text-[22px] font-semibold leading-[1.15]">
                          {scale.title}
                        </h3>
                        <p className="m-0 text-body-sm text-muted">
                          {scale.text}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
