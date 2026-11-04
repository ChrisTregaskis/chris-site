import { type CSSProperties, useRef } from "react";
import { AllCalls } from "./AllCalls";
import { CallList } from "./CallList";
import { SET_REPS } from "./calls";
import { STRAIN_OUTSET_EM } from "./countType";
import { CountRuler } from "./CountRuler";
import { DoneCall } from "./DoneCall";
import { SetCount } from "./SetCount";
import { RUN_HEIGHT } from "./stageRun";
import { useCalledSet } from "./useCalledSet";
import { useStageLayout } from "./useStageLayout";
import { useDeadZoneCues } from "@/features/scroll-feel";
import { cn } from "@/lib/cn";

interface CalledSetProps {
  still: boolean;
}

/**
 * A set of 100, counted out by scroll. The stage pins under the top bar
 * while its run scrolls by: the count rises from 0 to 100, the figure does
 * Navy SEALs on its baseline, and each of the app's calls says one line of
 * the story, beside the count where there's room and under it on phones.
 * At 100 the calls fade and Done eases in under the count; back under 100,
 * it reverses. Decorative to assistive tech, which reads the calls as a
 * list instead. Still (reduced motion): no pinning, the finished set with
 * every call and its line listed under the count.
 */
export function CalledSet({ still }: CalledSetProps) {
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement>(null);
  const baselineRef = useRef<HTMLSpanElement>(null);
  // Prototype c: the count strains through the slow last reps.
  const strain = useDeadZoneCues() && !still;
  const { reps, called } = useCalledSet(still, runRef, stageRef, strain);
  const layout = useStageLayout(
    gridRef,
    rulerRef,
    baselineRef,
    strain ? STRAIN_OUTSET_EM : 0,
  );
  const done = !still && reps >= SET_REPS;
  // Still, the calls are listed under the count, but the count keeps its
  // column, so the figure stays in front of it.
  const beside = layout.beside;

  return (
    <div ref={runRef} className={cn(!still && RUN_HEIGHT)}>
      <div
        ref={stageRef}
        aria-hidden="true"
        className={cn(
          "grid content-center",
          still
            ? "relative py-10"
            : "sticky top-nav h-[calc(100svh-var(--size-nav))]",
        )}
      >
        <CountRuler rulerRef={rulerRef} baselineRef={baselineRef} />
        <div
          ref={gridRef}
          className={cn(
            "grid gap-x-[clamp(24px,5vw,72px)]",
            beside && "grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]",
          )}
          style={{ "--count-fit": layout.fit } as CSSProperties}
        >
          <SetCount
            reps={reps}
            baseline={layout.baseline}
            still={still}
            strain={strain}
          />
          <p className="col-start-1 row-start-2 m-0 mt-3 text-body-sm text-muted">
            of {SET_REPS} Navy SEALs
          </p>
          {still ? (
            <AllCalls />
          ) : (
            <>
              <CallList
                called={called}
                beside={beside}
                push={layout.push}
                done={done}
              />
              <DoneCall done={done} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
