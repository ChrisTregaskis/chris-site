import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type NodeId } from "./geometry";
import { type GlyphId, Glyph } from "./glyphs";
import { type JourneyId } from "./journeys";
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

/** Each step's icon: in the picker in place of a number, and in its list. */
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

/** A step's text fading in with its ring, and out as it passes either way. */
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
 * the Wayfinder chapter's picker. The drawing pins; scrolling (an invisible
 * runway under it), the picker, or a press on a ring all select a step, and
 * each step reveals its ring, from the outside in, then the two side ways
 * in (scheduled work and the admin). Side by side, the step's words sit
 * beside the drawing and cross-fade with it, either way; stacked, there's
 * no room to pin them too, so each step's words scroll beneath the drawing
 * and fade in as their ring is revealed, out as it passes. Try it sends the
 * step's journey through what's been revealed: a pulse, lit routes and a
 * trace. Changing step, the chapter leaving the screen or another journey
 * cancels the one running and clears everything it lit. Reduced motion: no
 * fades, no travelling pulse; the words and rings change at once.
 */
export function RingsExplorer() {
  const reducedMotion = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
    reducedMotion,
  });
  const journey = useJourney(reducedMotion);
  const { cancel, run } = journey;
  const shown = current || 1;
  const step = stepAt(shown);

  // Every ring at once (Wayfinder's take it apart): kept until the step changes.
  const [override, setOverride] = useState<{
    step: number;
    all: boolean;
  } | null>(null);
  const all = override?.step === current ? override.all : false;

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

  const words = (id: StepId) => (
    <StepText
      step={STEPS[id]}
      pressed={pressed?.step === stepNumber(id) ? pressed.id : null}
      onPreview={(detail) =>
        setPreview(detail ? { step: id, id: detail } : null)
      }
      onPress={(detail) => press(id, detail)}
      journey={journey}
    />
  );

  return (
    <div ref={rootRef} className="relative" data-testid="rings-explorer">
      <div
        ref={stageRef}
        data-testid="rings-stage"
        data-bar-flush={stacked ? "" : undefined}
        className="sticky top-nav z-[2] flex flex-col items-center bg-surface pb-[14px] pt-2 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-surface after:to-surface/0 wide:grid wide:h-[calc(100svh-var(--size-nav))] wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:items-center wide:gap-[clamp(24px,5vw,72px)] wide:bg-transparent wide:pb-0 wide:pt-0 wide:after:hidden"
      >
        <div className="flex w-full flex-col items-center gap-[14px]">
          {/* Stacked, as wide as the screen (never taller than 56% of it, nor wider than 480px), so its type stays 13px or more at 320px. */}
          <div className="w-[min(100vw,56svh,480px)] max-w-none shrink-0 wide:w-[min(100%,66vh,580px)]">
            <RingsFigure
              current={current}
              all={all}
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
              reducedMotion={reducedMotion}
              marker={(n) => <Glyph id={ICON[stepAt(n).id]} />}
              name={(n) => stepAt(n).kicker}
              action={{
                label: "Try it",
                pressed: journey.running !== null,
                onClick: tryIt,
              }}
              toggle={
                stacked
                  ? null
                  : {
                      label: all ? "Back to ring by ring" : "Show every ring",
                      glyph: <Glyph id="rings" />,
                      onClick: () => setOverride({ step: current, all: !all }),
                    }
              }
            />
          </div>
        </div>

        {stacked ? null : (
          // Side by side: every step's words in one place, only the current
          // one shown, cross-fading as the rings change.
          <div
            data-testid="rings-words"
            className="grid self-start pt-[clamp(24px,10vh,120px)] [&>*]:col-start-1 [&>*]:row-start-1"
          >
            {STEP_ORDER.map((id) => {
              const n = stepNumber(id);
              const on = current === n;
              return (
                <div
                  key={id}
                  data-step-text={id}
                  aria-hidden={!on}
                  className={cn(
                    FADE,
                    "max-w-[440px] self-start text-ink",
                    on
                      ? "visible translate-y-0 opacity-100"
                      : cn(
                          "pointer-events-none invisible opacity-0",
                          n < current ? "-translate-y-2" : "translate-y-2",
                        ),
                  )}
                >
                  {words(id)}
                </div>
              );
            })}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {current ? `${step.kicker}: ${step.heading}` : ""}
        </p>
      </div>

      {/* The runway: what scrolling crosses to change step. Side by side it
          runs, unseen, under the pinned stage; stacked, it carries each step's
          words, shown only while their ring is the one revealed. */}
      <div
        className={cn(
          "relative",
          stacked ? "pb-[30vh] pt-[4vh]" : "mt-[calc(var(--size-nav)-100svh)]",
        )}
      >
        {STEP_ORDER.map((id) => {
          const n = stepNumber(id);
          const on = current === n;
          if (!stacked) {
            return (
              <div
                key={id}
                ref={stepRef(n)}
                data-step={id}
                aria-hidden="true"
                className="pointer-events-none h-[72vh]"
              >
                <div ref={cardRef(n)} className="h-full" />
              </div>
            );
          }
          return (
            <div
              key={id}
              ref={stepRef(n)}
              data-step={id}
              className="flex min-h-[64vh] items-end"
            >
              <div
                ref={cardRef(n)}
                data-step-text={id}
                aria-hidden={!on}
                className={cn(
                  FADE,
                  "w-full max-w-[34em] py-[22px] text-ink",
                  on ? "visible opacity-100" : "invisible opacity-0",
                )}
              >
                {words(id)}
              </div>
            </div>
          );
        })}
        {/* Side by side, room for the last step before the stage lets go. */}
        {stacked ? null : <div aria-hidden="true" className="h-[46vh]" />}
      </div>
    </div>
  );
}
