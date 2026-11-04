import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { DEPTH_QUERY } from "./depth/depthGeometry";
import { IsolationFigure } from "./IsolationFigure";
import { LeakTestControls } from "./LeakTestControls";
import { PHYSIO_STEPS } from "./organisations";
import { PHYSIO_HEADING } from "./physioHeading";
import { SignedInPicker } from "./SignedInPicker";
import { useLeakTest } from "./useLeakTest";
import { useNearScreen } from "./useNearScreen";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/**
 * Chapter 2: the physio and wellness platform's tenant isolation. Three
 * steps scroll past one sessions table under the query that reads it: the
 * table at rest, holding every organisation's rows; a request signed in as
 * one organisation, which gets only its own sessions back because the
 * policy is always on; and the policy named, with a leak test (sign in as
 * anyone, ask for another organisation's sessions by name, get nothing).
 *
 * Side by side, the figure pins beside the steps under the top bar, drawn
 * in 3D where there's room (`DEPTH_QUERY`) and flat where there isn't.
 * Stacked (phones), the flat figure pins under the top bar on an opaque
 * panel sized to it, the cards read beneath it, and the leak test's picker
 * and buttons move into the last card. Static (reduced motion): the end
 * state, no pinning, every state change instant.
 */
export function PhysioSection() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const roomy = useMediaQuery(DEPTH_QUERY);
  const stageRef = useRef<HTMLDivElement>(null);
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia(BELOW_WIDE).matches) {
      return focusLine(window.innerHeight, null);
    }
    // Stacked, the stage pins under the top bar: a card is read in the room beneath it.
    const pinnedTop = parseFloat(getComputedStyle(stage).top) || 0;
    return focusLine(window.innerHeight, pinnedTop + stage.offsetHeight);
  }, []);
  const { current, stepRef, cardRef } = useStepSync({
    measure,
    reducedMotion: still,
    enabled: !still,
  });
  const stage = still ? 3 : Math.max(1, current);
  const test = useLeakTest(stage, { still, watch: stageRef });
  const { view, pressing } = test;
  const drawing = roomy && !stacked ? "depth" : "flat";
  const drawn = useNearScreen(stageRef, still);

  return (
    <Section
      id="physio"
      labelledBy="physio-title"
      tone={{ from: "wayfinder", to: "physio" }}
    >
      <ChapterHeading
        id="physio-title"
        numeral="2"
        title={PHYSIO_HEADING.title}
        lede={PHYSIO_HEADING.lede}
        chips={PHYSIO_HEADING.chips}
      />
      <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
        <div
          ref={stageRef}
          data-testid="physio-stage"
          className={cn(
            "flex items-center justify-center",
            still
              ? "relative py-6"
              : "sticky top-nav z-[2] bg-surface py-2 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-surface after:to-surface/0 wide:z-[1] wide:h-[calc(100svh-var(--size-nav))] wide:bg-transparent wide:py-0 wide:after:hidden",
          )}
        >
          <IsolationFigure
            test={test}
            drawing={drawing}
            controlsInside={!stacked}
            drawn={drawn}
            still={still}
          />
        </div>
        <div
          className={cn(
            "relative z-[1] wide:z-[2]",
            still ? "pb-6" : "pb-6 pt-[4vh] wide:py-[30vh]",
          )}
        >
          {PHYSIO_STEPS.map((step, index) => {
            const n = index + 1;
            const on = still || current === n;
            const last = n === PHYSIO_STEPS.length;
            return (
              <div
                key={step.title}
                ref={stepRef(n)}
                className={cn(
                  "flex",
                  still
                    ? "py-2"
                    : "min-h-[64vh] items-end wide:min-h-[62vh] wide:items-center",
                )}
              >
                <div
                  ref={cardRef(n)}
                  className={cn(
                    "tone-ease w-full max-w-[34em] py-[22px] text-ink wide:w-auto wide:max-w-[430px]",
                    !on && "wide:tone-dim",
                  )}
                >
                  <span className={stepNumeralClasses(on)}>{n}</span>
                  <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[17px] text-muted">{step.text}</p>
                  {last && stacked ? (
                    <div
                      data-testid="leak-test-card"
                      className="mt-5 grid gap-3"
                    >
                      <SignedInPicker
                        shown
                        live={view.testing}
                        who={view.who}
                        onPick={test.pick}
                        pressing={
                          pressing?.kind === "pick" ? pressing.org : null
                        }
                        focusProps={test.focusProps}
                      />
                      <LeakTestControls
                        live={view.testing}
                        target={view.target}
                        asking={view.asking}
                        onTry={test.tryOther}
                        onReset={test.reset}
                        pressing={pressing}
                        demo={test.demo}
                        paused={test.paused}
                        onPause={test.pause}
                        onPlay={test.play}
                        focusProps={test.focusProps}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
