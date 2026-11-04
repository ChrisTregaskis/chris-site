import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, useCallback, useRef } from "react";
import { PHYSIO_VARIANT } from "./explore/variant";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { stepNumeralClasses } from "@/ui/atoms/stepNumeralClasses";
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
 * row-level security hides everyone else's. Side by side, the list pins
 * beside the steps. Stacked (phones), a compact list (tighter still on short
 * phones) pins under the top bar on an opaque panel, above the steps, so
 * each card is read in the room beneath it and then slides under it; the
 * panel is sized to its list, so nothing spills out of it into the next
 * chapter. Static (reduced motion): the end state.
 */
function PhysioClassic() {
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
      <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
        <div
          ref={stageRef}
          className={cn(
            "flex items-center justify-center",
            still
              ? "relative py-6"
              : "sticky top-nav z-[2] bg-surface py-2 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-surface after:to-surface/0 wide:top-[6vh] wide:z-[1] wide:h-[88vh] wide:bg-transparent wide:py-0 wide:after:hidden",
          )}
        >
          <figure
            className="m-0 w-full max-w-[440px]"
            aria-label="Sessions from three practices in one table"
          >
            <p
              className={cn(
                "m-0 mb-[6px] text-caption text-muted wide:mb-[10px] [@media(max-width:860px)_and_(max-height:700px)]:mb-1",
                FADE,
                practiceSet ? "opacity-100" : "opacity-0",
              )}
            >
              Signed in as Riverside Wellness
            </p>
            <div
              className={cn(
                "mb-[6px] py-[6px] text-caption font-medium text-accent wide:py-2 wide:text-[14px] [@media(max-width:860px)_and_(max-height:700px)]:py-1",
                FADE,
                practiceSet ? "opacity-100" : "opacity-0",
              )}
            >
              policy: tenant_id = current practice
            </div>
            <ul className="m-0 grid w-full list-none gap-[6px] p-0 wide:gap-[2px] [@media(max-width:860px)_and_(max-height:700px)]:gap-1">
              {ROWS.map((row) => {
                const hidden = filtered && row.practice !== "Riverside";
                return (
                  <li
                    key={row.label}
                    className={cn(
                      "grid grid-cols-[12px_1fr_auto] items-center gap-[10px] py-[5px] text-[14px] leading-[1.5] transition-[opacity,transform,filter] duration-state motion-reduce:transition-none wide:py-[10px] wide:text-[17px] wide:leading-[1.6] [@media(max-width:860px)_and_(max-height:700px)]:py-[3px] [@media(max-width:860px)_and_(max-height:700px)]:text-[13px] [@media(max-width:860px)_and_(max-height:700px)]:leading-[1.4]",
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
            "relative z-[1] wide:z-[2]",
            still ? "pb-6" : "pb-6 pt-[4vh] wide:py-[30vh]",
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

/*
 * Design exploration (branch explore/physio): `?physio=a|b|c` swaps in a
 * prototype direction, each in its own lazy chunk; no param is the live
 * section above, unchanged.
 */
const DIRECTIONS = {
  a: lazy(() =>
    import("./explore/DirectionA").then((m) => ({ default: m.DirectionA })),
  ),
  b: lazy(() =>
    import("./explore/DirectionB").then((m) => ({ default: m.DirectionB })),
  ),
  c: lazy(() =>
    import("./explore/DirectionC").then((m) => ({ default: m.DirectionC })),
  ),
};

export function PhysioSection() {
  if (!PHYSIO_VARIANT) return <PhysioClassic />;
  const Direction = DIRECTIONS[PHYSIO_VARIANT];
  return (
    <Suspense fallback={null}>
      <Direction />
    </Suspense>
  );
}
