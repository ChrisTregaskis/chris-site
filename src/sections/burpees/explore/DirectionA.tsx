import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { BeatFrame } from "./BeatFrame";
import { BurpeesLinks } from "./BurpeesLinks";
import { BURPEES_TITLE, PLATE_LEDE, PLATE_STEPS } from "./copy";
import { holdFor, NAVY_SEAL, SIX_COUNT } from "./plateCells";
import { Plate } from "./Plate";
import { usePlayhead } from "./usePlayhead";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";
import { DURATION, EASE } from "@/ui/tokens/motion";

/**
 * Direction A, the motion study. The app's central idea, positions not
 * counts, drawn as a chronophotograph plate of one rep in the app's own art.
 * Side by side the plate pins beside three steps: the Navy SEAL's twelve
 * positions and ten counts, played on the beat; the knees taken out, the
 * shared cells sliding into a six-count; and the plate collapsed to one
 * frame cutting hard on the beat, over the rep's rhythm. Phones: the Navy
 * SEAL plate above the three steps, no pinning. Reduced motion: the plate
 * whole and still, every step shown.
 */
export function DirectionA() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const stageRef = useRef<HTMLDivElement>(null);
  const tracking = !still && !stacked;
  const measure = useCallback(() => focusLine(window.innerHeight, null), []);
  const { current, stepRef, cardRef } = useStepSync({
    measure,
    reducedMotion: still,
    enabled: tracking,
  });
  const step = tracking ? Math.max(1, current) : 1;
  const cells = step === 2 ? SIX_COUNT : NAVY_SEAL;
  const playing = usePlayhead(
    cells.length,
    (index) => holdFor(cells, index),
    !still,
    stageRef,
    String(step),
  );

  return (
    <Section
      id="burpees"
      labelledBy="burpees-title"
      tone={{ from: "physio", to: "burpees", feather: "70vh" }}
    >
      <ChapterHeading
        id="burpees-title"
        numeral="3"
        title={BURPEES_TITLE}
        lede={PLATE_LEDE}
      />
      <BurpeesLinks className="mt-3" />
      <div className="relative mt-10 wide:mt-0 wide:grid wide:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] wide:gap-[clamp(32px,5vw,80px)]">
        <div
          ref={stageRef}
          className={cn(
            "flex items-center justify-center",
            tracking && "sticky top-nav h-[calc(100svh-var(--size-nav))] py-6",
          )}
        >
          <VisuallyHidden>
            The app's figure drawn position by position through one Navy SEAL
            burpee: twelve positions, ten of them counted.
          </VisuallyHidden>
          <div className="w-full max-w-[calc((100svh-var(--size-nav)-180px)*4/3)]">
            <AnimatePresence initial={false} mode="wait">
              {step === 3 ? (
                <motion.div
                  key="beat"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.state, ease: EASE.enter }}
                  className="mx-auto max-w-[620px]"
                >
                  <BeatFrame cells={NAVY_SEAL} playing={playing} />
                </motion.div>
              ) : (
                <motion.div
                  key="plate"
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: DURATION.base }}
                >
                  <Plate cells={cells} playing={playing} still={still} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className={cn(tracking ? "py-[30vh]" : "pt-6")}>
          {PLATE_STEPS.map((item, index) => {
            const n = index + 1;
            const on = !tracking || current === n || (current === 0 && n === 1);
            return (
              <div
                key={item.title}
                ref={stepRef(n)}
                className={cn(
                  "flex",
                  tracking ? "min-h-[70vh] items-center" : "py-2",
                )}
              >
                <div
                  ref={cardRef(n)}
                  className={cn(
                    "tone-ease max-w-[34em] py-[22px] text-ink wide:max-w-[400px]",
                    !on && "tone-dim",
                  )}
                >
                  <span className={stepNumeralClasses(on)}>{n}</span>
                  <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="m-0 text-[17px] text-muted">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
