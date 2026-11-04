import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { POSES } from "../burpeeSet";
import { FRAMES } from "../frames";
import { useSealBeat } from "../useSealBeat";
import { BurpeesLinks } from "./BurpeesLinks";
import { callAt, CALLS, repsAt, SET_REPS } from "./calls";
import { BURPEES_TITLE, CALLS_LEDE } from "./copy";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { cn } from "@/lib/cn";
import { stickyProgress } from "@/lib/scrollProgress";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";

/** The last call, which moves below the count once the set is done. */
const DONE = CALLS[CALLS.length - 1];

/**
 * Puts the "Done" block just below the count's column, measured each frame
 * (two rects; the stage is pinned, so it only moves when the calls beside
 * it grow or the screen changes). Writes only when it would change.
 */
function placeDone(
  stage: HTMLElement,
  column: HTMLElement | null,
  block: HTMLElement | null,
) {
  if (!column || !block) return;
  const top = `${Math.round(column.getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 20)}px`;
  if (block.style.top !== top) block.style.top = top;
}

/**
 * The count's type: the chapter numeral's, sized by the screen. Joined as
 * a plain string, not through `cn`: tailwind-merge would drop the line
 * height when a font size follows it.
 */
const NUMERAL =
  "font-display font-bold tabular-nums leading-[0.8] tracking-[-0.06em] text-accent-strong [font-variation-settings:'opsz'_96]";

/**
 * Direction C, called out. No phone: the set itself, set as type. The stage
 * pins while the section scrolls a set of 100, the count huge in the
 * chapter-numeral violet with the app's figure doing Navy SEALs in front of
 * it at the app's beat, and the story told in the app's own spoken calls,
 * each with one line: who it's for, how it's used, why low stakes let it
 * be built as an experiment, how it grew, what it doesn't track, and that
 * it's free. At 100 the list fades and "Done" comes in below the count,
 * clear of the three digits however wide they're drawn. Reduced motion: a
 * finished set, one frame, every call and line listed under the count, no
 * pinning.
 */
export function DirectionC() {
  const still = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stickTop = useRef(0);
  const columnRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
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
    placeDone(stage, columnRef.current, doneRef.current);
  }, []);
  useScrollFrame(onFrame, !still, sectionRef);

  const shownReps = still ? SET_REPS : reps;
  const shownCall = still ? CALLS.length - 1 : called;
  /*
   * At 100 the count is three digits, as wide as the browser draws them, so
   * the calls step out of its way: the list fades and "Done" with its line
   * comes in below the count, clear of the digits at any width. Back under
   * 100, it reverses.
   */
  const done = !still && shownReps >= SET_REPS;

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
              "grid content-center gap-[clamp(16px,3vh,40px)]",
              // Still, the finished set's calls stack under the count, so
              // three digits of any width never sit over them.
              still
                ? "py-10"
                : "sticky top-nav h-[calc(100svh-var(--size-nav))] wide:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] wide:items-end",
            )}
          >
            <div ref={columnRef} className="relative">
              <p
                className={`${NUMERAL} m-0 whitespace-nowrap text-[min(42vw,22svh)] wide:text-[min(24vw,46svh)]`}
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
            <ol
              className={cn(
                "relative z-[1] m-0 list-none p-0 transition-[opacity,visibility] duration-slow ease-enter motion-reduce:transition-none wide:pb-10",
                done && "invisible opacity-0",
              )}
            >
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
            {still ? null : (
              <div
                ref={doneRef}
                className={cn(
                  "absolute left-0 top-0 z-[1] transition-[opacity,transform,visibility] duration-slow ease-enter motion-reduce:transition-none",
                  done
                    ? "translate-y-0 opacity-100"
                    : "invisible translate-y-3 opacity-0",
                )}
              >
                <p className="m-0 font-display text-[clamp(34px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-signal">
                  {DONE.call}
                </p>
                <p className="m-0 mt-2 text-ink wide:text-body-lg">
                  {DONE.line}
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
