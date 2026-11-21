import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type NodeId } from "./geometry";
import { type GlyphId, Glyph } from "./glyphs";
import { type JourneyId } from "./journeys";
import { JourneyTrace } from "./JourneyTrace";
import { type Highlight, NO_HIGHLIGHT, RingsFigure } from "./RingsFigure";
import { NODE_STEP, type StepId, STEP_ORDER, stepNumber, STEPS } from "./story";
import { StepText } from "./StepText";
import { useJourney } from "./useJourney";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { StepPicker } from "@/ui/organisms/StepPicker";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/** Each step's icon: in the picker in place of a number. */
const ICON: Record<StepId, GlyphId> = {
  edge: "door",
  network: "blocked",
  functions: "key",
  centre: "role",
  queue: "clock",
  admin: "eye",
};

const OPTIONS = STEP_ORDER.map((id) => ({
  value: stepNumber(id),
  label: STEPS[id].kicker,
  marker: <Glyph id={ICON[id]} />,
}));

const stepAt = (n: number) => STEPS[STEP_ORDER[Math.max(1, n) - 1]];

/** A step's words fading in as they arrive with their ring, out as they leave. */
const FADE =
  "transition-[opacity,transform,visibility] duration-state ease-enter motion-reduce:transition-none";

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
 * Chapter 2, next draft: the platform as rings round its data, told with
 * the Wayfinder chapter's picker. The drawing pins while each step's words
 * scroll past it (beside it side by side, beneath it stacked); scrolling,
 * the picker or a press on a ring all select a step, and each step reveals
 * its ring, from the outside in, then the two side ways in (scheduled work
 * and the admin). A step's words fade in as they arrive with their ring and
 * out as they leave, in either direction, so the words in view always match
 * the drawing. Try it sends the step's journey through what's been
 * revealed: a pulse, lit routes and a trace in place of the step's details.
 * Changing step, the chapter leaving the screen or another journey cancels
 * the one running and clears everything it lit. Static (reduced motion):
 * nothing pins or fades, every ring and every step's words are shown, and
 * the picker chooses which ring's journey Try it sends, its trace under it.
 */
export function RingsExplorer() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia(BELOW_WIDE).matches) {
      return focusLine(window.innerHeight, null);
    }
    // Stacked, the stage pins under the top bar: words are read in the room beneath it.
    const pinnedTop = parseFloat(getComputedStyle(stage).top) || 0;
    return focusLine(window.innerHeight, pinnedTop + stage.offsetHeight);
  }, []);
  const { current, stepRef, cardRef, goTo } = useStepSync({
    measure,
    reducedMotion: still,
    enabled: !still,
  });
  const journey = useJourney(still);
  const { cancel, run } = journey;
  const shown = current || 1;
  const step = stepAt(shown);

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
    return pressedId ? highlightOf(step.id, pressedId) : NO_HIGHLIGHT;
  }, [preview, pressedId, step.id]);

  // A new step cancels whatever journey was running, and clears what it lit;
  // Try it before any step is selected goes to the first and runs its journey.
  const queued = useRef<JourneyId | null>(null);
  useEffect(() => {
    cancel();
    const next = queued.current;
    queued.current = null;
    if (next && current > 0 && stepAt(current).journey === next) {
      void run(next);
    }
  }, [current, cancel, run]);

  // So does the chapter leaving the screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.every((entry) => !entry.isIntersecting)) cancel();
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [cancel]);

  const tryIt = () => {
    if (current === 0) {
      queued.current = STEPS.edge.journey;
      goTo(stepNumber("edge"));
      return;
    }
    void run(step.journey);
    // The trace takes the details' place at the foot of the step's words:
    // if that's below the screen, bring it up (the step stays the same).
    const card = cards.current[current - 1];
    if (
      !still &&
      card &&
      card.getBoundingClientRect().bottom > window.innerHeight
    ) {
      goTo(current, { align: "end" });
    }
  };

  const press = (id: StepId, detail: string) => {
    const n = stepNumber(id);
    if (n !== current) goTo(n);
    setPressed(
      pressedId === detail && n === current ? null : { step: n, id: detail },
    );
  };

  const selectNode = (id: NodeId) => {
    const n = NODE_STEP.get(id);
    if (n) goTo(n);
  };

  return (
    <div
      ref={rootRef}
      data-testid="rings-explorer"
      className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]"
    >
      <div
        ref={stageRef}
        data-testid="rings-stage"
        data-bar-flush={stacked && !still ? "" : undefined}
        className={cn(
          "flex flex-col items-center",
          still
            ? "relative py-6 wide:self-start"
            : "sticky top-nav z-[2] bg-surface pb-[14px] pt-2 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-surface after:to-surface/0 wide:z-[1] wide:h-[calc(100svh-var(--size-nav))] wide:justify-center wide:bg-transparent wide:p-0 wide:after:hidden",
        )}
      >
        <div className="flex w-full flex-col items-center gap-[14px]">
          {/* Stacked, as wide as the screen (never taller than 56% of it, nor wider than 480px), so its type stays 13px or more at 320px. */}
          <div className="w-[min(100vw,56svh,480px)] max-w-none shrink-0 wide:w-[min(100%,66vh,580px)]">
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
          <div className="flex w-full max-w-[480px] flex-col gap-[14px]">
            <StepPicker
              label="Physio ring"
              options={OPTIONS}
              value={current}
              shown={shown}
              valueText={step.kicker}
              onSelect={(n) => goTo(n)}
              reducedMotion={still}
              marker={(n) => <Glyph id={ICON[stepAt(n).id]} />}
              name={(n) => stepAt(n).kicker}
              action={{
                label: "Try it",
                pressed: journey.running !== null,
                onClick: tryIt,
              }}
            />
            {still && journey.shown ? (
              // Static, the words are a long way below: the trace sits here.
              <JourneyTrace
                journey={journey}
                clearLabel="Clear the trace"
                className="mt-2"
              />
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {current ? `${step.kicker}: ${step.heading}` : ""}
        </p>
      </div>

      {/* Every step's words, scrolling past the drawing: each shown only
          while its ring is the one revealed (static: all of them). */}
      <div
        className={cn(
          "relative z-[1] wide:z-[2]",
          still ? "pb-6" : "pb-[30vh] pt-[4vh] wide:py-[30vh]",
        )}
      >
        {STEP_ORDER.map((id) => {
          const n = stepNumber(id);
          const on = still || current === n;
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
              <div
                ref={(element) => {
                  cardRef(n)(element);
                  cards.current[n - 1] = element;
                }}
                data-step-text={id}
                aria-hidden={!on}
                className={cn(
                  FADE,
                  "w-full max-w-[34em] py-[22px] text-ink wide:w-auto wide:max-w-[430px]",
                  on
                    ? "visible translate-y-0 opacity-100"
                    : cn(
                        "pointer-events-none invisible opacity-0",
                        n < current ? "-translate-y-3" : "translate-y-3",
                      ),
                )}
              >
                <StepText
                  step={STEPS[id]}
                  pressed={pressed?.step === n ? pressed.id : null}
                  onPreview={(detail) =>
                    setPreview(detail ? { step: id, id: detail } : null)
                  }
                  onPress={(detail) => press(id, detail)}
                  journey={journey}
                  traceHere={!still}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
