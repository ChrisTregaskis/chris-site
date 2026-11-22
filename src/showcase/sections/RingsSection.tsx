import { useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { DetailList } from "@/sections/physio/rings/DetailList";
import { NO_HIGHLIGHT } from "@/sections/physio/rings/highlight";
import { JourneyTrace } from "@/sections/physio/rings/JourneyTrace";
import { RingsFigure } from "@/sections/physio/rings/RingsFigure";
import { STEP_ORDER, stepNumber, STEPS } from "@/sections/physio/rings/story";
import { useJourney } from "@/sections/physio/rings/useJourney";
import { Button } from "@/ui/atoms/Button";

/**
 * The physio rings on their own: any step (each draws its part on, and off
 * going back), every ring at once, a step's details picking their parts
 * out, and Try it sending that step's journey through. On the page the
 * steps follow the scroll; here the buttons choose.
 */
export function RingsSection() {
  const reduced = useReducedMotion() ?? false;
  const [current, setCurrent] = useState(1);
  const [all, setAll] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const journey = useJourney(reduced);
  const step = STEPS[STEP_ORDER[Math.max(1, current) - 1]];

  const highlight = useMemo(() => {
    const detail = step.details.find((d) => d.id === (preview ?? pressed));
    if (!detail) return NO_HIGHLIGHT;
    return {
      nodes: new Set(detail.nodes),
      routes: new Set(detail.routes ?? []),
      rings: new Set(detail.rings ?? []),
    };
  }, [step, preview, pressed]);

  const choose = (n: number) => {
    journey.cancel();
    setPressed(null);
    setCurrent(n);
  };

  return (
    <ShowcaseSection title="Rings">
      <p className="mb-6 max-w-measure text-muted">
        The physio platform from above, as rings round its data. Each step draws
        its part on as if by hand, lines first and each icon as its line reaches
        it, and undraws it the other way. Try it sends the step&apos;s journey
        through what it has drawn: a red-pen pulse, routes highlighted behind
        it, a wall that holds marked in red, and a trace. A step&apos;s details
        pick their parts out.
      </p>
      <div className="grid items-start gap-10 wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="max-w-[520px]">
          <RingsFigure
            current={current}
            all={all || reduced}
            highlight={highlight}
            hot={journey.hot}
            held={journey.held}
            lit={journey.lit}
            token={journey.token}
            pulseRef={journey.pulseRef}
            onNode={() => {}}
          />
        </div>
        <div className="flex flex-col gap-5">
          <div
            role="group"
            aria-label="Step"
            className="flex flex-wrap gap-x-4 gap-y-2 text-[14px]"
          >
            <Button
              variant="ghost"
              pressed={current === 0}
              onClick={() => choose(0)}
            >
              None
            </Button>
            {STEP_ORDER.map((id) => (
              <Button
                key={id}
                variant="ghost"
                pressed={current === stepNumber(id)}
                onClick={() => choose(stepNumber(id))}
              >
                {STEPS[id].kicker}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            <Button
              variant="ghost"
              pressed={all}
              onClick={() => setAll((value) => !value)}
            >
              Every ring
            </Button>
            <Button
              variant="ghost"
              pressed={journey.running !== null}
              onClick={() => void journey.run(step.journey)}
            >
              Try it
            </Button>
          </div>
          {journey.shown ? (
            <JourneyTrace journey={journey} clearLabel="Clear the trace" />
          ) : (
            <DetailList
              label={`Inside ${step.kicker.toLowerCase()}`}
              details={step.details}
              pressed={pressed}
              onPreview={setPreview}
              onPress={(id) =>
                setPressed((value) => (value === id ? null : id))
              }
            />
          )}
        </div>
      </div>
    </ShowcaseSection>
  );
}
