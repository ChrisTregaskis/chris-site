import { useReducedMotion } from "framer-motion";
import { type ReactNode, useCallback, useRef } from "react";
import { type StoryStep, STEPS } from "./practices";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

interface ExploreShellProps {
  /**
   * The pinned figure for a stage: 1 to 3 as the steps are read (1 before
   * any is selected), 3 when still (reduced motion: the end state).
   */
  renderStage: (stage: number, still: boolean) => ReactNode;
  steps?: readonly StoryStep[];
  /** Grid columns on wide screens (figure, then steps). */
  columns?: string;
}

/**
 * The physio chapter's frame, shared by the prototypes: the same opener,
 * step machinery and pinned stage as the live section, with the figure
 * left to each direction.
 */
export function ExploreShell({
  renderStage,
  steps = STEPS,
  columns = "wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]",
}: ExploreShellProps) {
  const still = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia(BELOW_WIDE).matches) {
      return focusLine(window.innerHeight, null);
    }
    const pinnedTop = parseFloat(getComputedStyle(stage).top) || 0;
    return focusLine(window.innerHeight, pinnedTop + stage.offsetHeight);
  }, []);
  const { current, stepRef, cardRef } = useStepSync({
    measure,
    reducedMotion: still,
    enabled: !still,
  });
  const stage = still ? 3 : Math.max(1, current);

  return (
    <Section
      id="physio"
      labelledBy="physio-title"
      tone={{ from: "wayfinder", to: "physio" }}
    >
      <ChapterHeading
        id="physio-title"
        numeral="2"
        title="A multi-tenant SaaS for physio and wellness practices"
        lede="Bookings and client notes for many wellness practices, from one codebase and one database. A personal project, built with my own AI-assisted Claude Code workflow."
        chips={[
          "React",
          "tRPC",
          "Zod",
          "Drizzle",
          "Postgres RLS",
          "SST",
          "Turborepo",
        ]}
      />
      <div
        className={cn(
          "relative wide:grid wide:gap-[clamp(24px,5vw,72px)]",
          columns,
        )}
      >
        <div
          ref={stageRef}
          className={cn(
            "flex items-center justify-center",
            still
              ? "relative py-6"
              : "sticky top-nav z-[2] bg-surface py-2 wide:top-[6vh] wide:z-[1] wide:h-[88vh] wide:bg-transparent wide:py-0",
          )}
        >
          {renderStage(stage, still)}
        </div>
        <div
          className={cn(
            "relative z-[1] wide:z-[2]",
            still ? "pb-6" : "pb-6 pt-[4vh] wide:py-[30vh]",
          )}
        >
          {steps.map((step, index) => {
            const n = index + 1;
            const on = still || current === n;
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
