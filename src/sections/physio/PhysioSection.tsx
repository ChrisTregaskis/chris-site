import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { ChapterHeading } from "@/ui/molecules/ChapterHeading";
import { Section } from "@/ui/molecules/Section";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

const STEPS = [
  {
    title: "One database, every practice",
    text: "Sessions from every practice live in the same Postgres tables. Cheap to run and simple to migrate.",
  },
  {
    title: "Every request names its practice",
    text: "The tRPC context sets the current practice on the connection before a single query runs.",
  },
  {
    title: "Postgres hides the rest",
    text: "Row-level security filters out other practices' rows in the database itself, so a missed filter in app code can't leak data.",
  },
] as const;

type Practice = "Riverside" | "Harbour" | "Moorland";

const ROWS: { label: string; practice: Practice }[] = [
  { label: "First session", practice: "Riverside" },
  { label: "Sports massage", practice: "Harbour" },
  { label: "Mobility plan, week 3", practice: "Riverside" },
  { label: "Posture check-in", practice: "Moorland" },
  { label: "Follow-up session", practice: "Harbour" },
  { label: "Session notes", practice: "Riverside" },
  { label: "Running form review", practice: "Moorland" },
];

const DOT: Record<Practice, string> = {
  Riverside: "bg-accent",
  Harbour: "bg-signal",
  Moorland: "bg-tenant-teal",
};

const FADE = "transition-opacity duration-state motion-reduce:transition-none";

/**
 * Chapter 2: the physio and wellness SaaS. Three steps scroll past a list of
 * sessions from three practices: all of them, then the practice is set, then
 * row-level security hides everyone else's. Static (reduced motion): the end state.
 */
export function PhysioSection() {
  const still = useReducedMotion() ?? false;
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
  const practiceSet = stage >= 2;
  const filtered = stage >= 3;

  return (
    <Section id="physio" labelledBy="physio-title">
      <ChapterHeading
        id="physio-title"
        title="A multi-tenant SaaS for physio and wellness practices"
        lede="Bookings and client notes for many wellness practices, from one codebase and one database. A personal project, built with my own agentic Claude Code workflow."
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
      <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
        <div
          ref={stageRef}
          className={cn(
            "flex items-center justify-center",
            still
              ? "relative py-6"
              : "sticky top-nav z-[1] h-[46vh] bg-gradient-to-b from-surface from-85% to-surface/0 py-2 wide:top-[6vh] wide:h-[88vh] wide:bg-none wide:py-0",
          )}
        >
          <figure
            className="m-0 w-full max-w-[440px]"
            aria-label="Sessions from three practices in one table"
          >
            <p
              className={cn(
                "m-0 mb-[10px] text-caption text-muted",
                FADE,
                practiceSet ? "opacity-100" : "opacity-0",
              )}
            >
              Signed in as Riverside Wellness
            </p>
            <div
              className={cn(
                "mb-[6px] rounded-input border-[1.5px] border-dashed border-muted px-3 py-2 text-caption font-medium text-muted",
                FADE,
                practiceSet ? "opacity-100" : "opacity-0",
              )}
            >
              policy: tenant_id = current practice
            </div>
            <ul className="m-0 grid w-full list-none gap-2 p-0">
              {ROWS.map((row) => {
                const hidden = filtered && row.practice !== "Riverside";
                return (
                  <li
                    key={row.label}
                    className={cn(
                      "grid grid-cols-[12px_1fr_auto] items-center gap-[10px] rounded-row border border-line bg-panel px-3 py-[10px] text-[14.5px] leading-[1.6] transition-[opacity,transform,filter] duration-state motion-reduce:transition-none",
                      hidden && "translate-x-[14px] opacity-[0.12] saturate-0",
                    )}
                  >
                    <i
                      aria-hidden="true"
                      className={cn(
                        "size-[10px] rounded-pill",
                        DOT[row.practice],
                      )}
                    />
                    {row.label}
                    <small className="text-[12px] text-muted">
                      {row.practice}
                      {hidden ? (
                        <span className="sr-only">, hidden</span>
                      ) : null}
                    </small>
                  </li>
                );
              })}
            </ul>
          </figure>
        </div>
        <div
          className={cn(
            "relative z-[2]",
            still ? "pb-6" : "pb-[20vh] pt-[4vh] wide:py-[30vh]",
          )}
        >
          {STEPS.map((step, index) => {
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
                    "tone-ease w-full rounded-card border bg-panel/[0.96] px-6 py-[22px] text-ink transition-[border-color,background-color] duration-state motion-reduce:transition-none wide:w-auto wide:max-w-[430px]",
                    on
                      ? "border-accent-strong wide:bg-panel"
                      : "border-line wide:tone-dim wide:border-line/[0.45] wide:bg-panel/[0.45]",
                  )}
                >
                  <span
                    className={cn(
                      "mb-[10px] inline-grid size-7 place-items-center rounded-pill text-[14px] font-semibold leading-none",
                      on ? "bg-accent text-on-accent" : "bg-raised text-ink",
                    )}
                  >
                    {n}
                  </span>
                  <h3 className="m-0 mb-[6px] font-display text-title font-semibold">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[16px] text-muted">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
