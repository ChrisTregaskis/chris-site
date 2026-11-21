import { motion, useReducedMotion } from "framer-motion";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { DetailList } from "./DetailList";
import { type NodeId } from "./geometry";
import { type GlyphId, Glyph } from "./glyphs";
import { JourneyPanel } from "./JourneyPanel";
import { type Highlight, NO_HIGHLIGHT, RingsFigure } from "./RingsFigure";
import {
  NODE_STEP,
  type StepId,
  STEP_ORDER,
  stepNumber,
  STEPS,
  TRY_STEP,
} from "./story";
import { useJourney } from "./useJourney";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { Button } from "@/ui/atoms/Button";
import { useMotionPreset } from "@/ui/motion/useMotionPreset";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

const BADGE: Record<StepId, GlyphId> = {
  edge: "door",
  network: "blocked",
  functions: "key",
  centre: "role",
  queue: "clock",
  admin: "eye",
  try: "play",
};

const REVEAL_VIEW = { once: true, margin: "0px 0px -15% 0px" } as const;

/** A step's text fades up into place the first time it scrolls into view. */
function Reveal({ still, children }: { still: boolean; children: ReactNode }) {
  const reveal = useMotionPreset("fadeUp");
  return (
    <motion.div
      initial={still ? false : reveal.initial}
      whileInView={reveal.animate}
      viewport={REVEAL_VIEW}
      transition={reveal.transition}
    >
      {children}
    </motion.div>
  );
}

/** Whatever a step's detail picks out, as sets the drawing can test. */
function highlightOf(step: StepId, detailId: string | null): Highlight {
  const detail = STEPS[step].details.find((d) => d.id === detailId);
  if (!detail) return NO_HIGHLIGHT;
  return {
    nodes: new Set(detail.nodes),
    routes: new Set(detail.routes ?? []),
    rings: new Set(detail.rings ?? []),
  };
}

/**
 * Chapter 2, next draft: the platform as rings round its data, told the way
 * the Wayfinder chapter tells its board. The drawing pins while a card for
 * each step scrolls past; scrolling, clicking the drawing or a card's badge
 * all select the same step, and each step reveals its ring (outside in, then
 * the two side ways in: scheduled work and the admin). A step's details pick
 * their part out in amber. The last step sends journeys through it, with a
 * pulse, lit routes and a trace; nothing runs by itself. Stacked (phones,
 * tablets held upright), the drawing pins under the top bar as wide as the
 * screen and the cards read beneath it. Static (reduced motion): everything
 * shown, no pinning, journeys light their routes at once.
 */
export function RingsExplorer() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
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
  const { current, stepRef, cardRef, goTo } = useStepSync({
    measure,
    reducedMotion: still,
    enabled: !still,
  });
  const journey = useJourney(still);

  const shownStep = current || 1;
  const stepId = STEP_ORDER[shownStep - 1];

  // A detail picked out: pressed (kept until the step changes) or previewed.
  const [pressed, setPressed] = useState<{ step: number; id: string } | null>(
    null,
  );
  const [preview, setPreview] = useState<{ step: StepId; id: string } | null>(
    null,
  );
  const pressedId = pressed?.step === current ? pressed.id : null;
  const highlight = useMemo(() => {
    if (preview) return highlightOf(preview.step, preview.id);
    return pressedId ? highlightOf(stepId, pressedId) : NO_HIGHLIGHT;
  }, [preview, pressedId, stepId]);

  const press = (step: StepId, id: string) => {
    const n = stepNumber(step);
    if (n !== current) goTo(n);
    setPressed(pressedId === id && n === current ? null : { step: n, id });
  };

  const selectNode = (id: NodeId) => {
    const n = NODE_STEP.get(id);
    if (n) goTo(n);
  };

  const panel = (
    <JourneyPanel
      running={journey.running}
      last={journey.last}
      trace={journey.trace}
      result={journey.result}
      onRun={(journeyId) => {
        if (!still && current !== TRY_STEP) goTo(TRY_STEP);
        void journey.run(journeyId);
      }}
    />
  );

  const announcement = current
    ? `${STEPS[stepId].kicker}: ${STEPS[stepId].heading}`
    : "";

  return (
    <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
      <div
        ref={stageRef}
        data-testid="rings-stage"
        data-bar-flush={stacked && !still ? "" : undefined}
        className={cn(
          "flex flex-col items-center",
          still
            ? "relative py-6"
            : "sticky top-nav z-[2] bg-surface pb-2 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-surface after:to-surface/0 wide:z-[1] wide:h-[calc(100svh-var(--size-nav))] wide:justify-center wide:bg-transparent wide:pb-0 wide:after:hidden",
        )}
      >
        {/* Stacked, as wide as the screen (never taller than 56% of it, nor wider than 480px), so its type stays 13px or more at 320px. */}
        <div className="w-[min(100vw,56svh,480px)] max-w-none shrink-0 wide:w-[min(100%,74vh,600px)]">
          <RingsFigure
            current={current}
            all={still}
            highlight={highlight}
            hot={journey.hot}
            held={journey.held}
            lit={journey.lit}
            token={journey.token}
            pulseRef={journey.pulseRef}
            onNode={selectNode}
          />
        </div>
        {stacked || still ? null : (
          <Button
            pressed={current === TRY_STEP}
            onClick={() => goTo(TRY_STEP)}
            className="mt-4 h-10 flex-none rounded-control px-5 py-0"
          >
            Try a journey
          </Button>
        )}
        {still ? (
          // Static (reduced motion), nothing pins: the journeys sit under the
          // drawing they travel, rather than a long way below it.
          <div className="mt-6 w-full max-w-[460px]">
            <span className="mb-[6px] block text-[14px] font-medium text-muted">
              {STEPS.try.kicker}
            </span>
            <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
              {STEPS.try.heading}
            </h3>
            <p className="m-0 text-[17px] text-muted">{STEPS.try.text}</p>
            {panel}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div
        className={cn(
          "relative z-[1] wide:z-[2]",
          still ? "pb-6" : "pb-[30vh] pt-[4vh] wide:py-[30vh]",
        )}
      >
        {(still ? STEP_ORDER.filter((id) => id !== "try") : STEP_ORDER).map(
          (id) => {
            const step = STEPS[id];
            const n = stepNumber(id);
            const on = still || current === n;
            const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
              if (id === "try") return;
              if (
                event.target instanceof Element &&
                event.target.closest("[data-no-select], a, input")
              ) {
                return;
              }
              goTo(n);
            };
            return (
              <div
                key={id}
                ref={stepRef(n)}
                data-step={id}
                className={cn(
                  "flex",
                  still
                    ? "py-2"
                    : "min-h-[64vh] items-end wide:min-h-[62vh] wide:items-center",
                )}
              >
                {/* The badge is the keyboard route; the card click is a shortcut. */}
                <div
                  ref={cardRef(n)}
                  onClick={onCardClick}
                  className={cn(
                    "group tone-ease w-full max-w-[34em] py-[22px] text-ink wide:w-auto",
                    id === "try"
                      ? "cursor-auto wide:max-w-[460px]"
                      : "cursor-pointer wide:max-w-[430px]",
                    !on && "wide:[&:not(:hover)]:tone-dim",
                  )}
                >
                  <Reveal still={still}>
                    <button
                      type="button"
                      aria-label={`Show ${step.kicker.toLowerCase()}`}
                      aria-current={on && !still ? "step" : undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        goTo(n);
                      }}
                      className={cn(
                        "mb-2 grid size-10 cursor-pointer place-items-center rounded-pill border-0 bg-transparent p-0 transition-colors duration-base motion-reduce:transition-none",
                        on
                          ? "text-accent"
                          : "text-muted group-hover:text-accent",
                      )}
                    >
                      <Glyph id={BADGE[id]} className="size-[30px]" />
                    </button>
                    <span className="mb-[6px] block text-[14px] font-medium text-muted">
                      {step.kicker}
                    </span>
                    <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
                      {step.heading}
                    </h3>
                    <p className="m-0 text-[17px] text-muted">{step.text}</p>
                    {step.details.length ? (
                      <DetailList
                        label={`Inside ${step.kicker.toLowerCase()}`}
                        details={step.details}
                        pressed={pressed?.step === n ? pressed.id : null}
                        onPreview={(detail) =>
                          setPreview(detail ? { step: id, id: detail } : null)
                        }
                        onPress={(detail) => press(id, detail)}
                      />
                    ) : null}
                    {id === "try" ? panel : null}
                  </Reveal>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
