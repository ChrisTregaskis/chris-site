import { DetailList } from "./DetailList";
import { Glyph } from "./glyphs";
import { JourneyTrace } from "./JourneyTrace";
import { journeyById } from "./journeys";
import { type Step } from "./story";
import { type JourneyState } from "./useJourney";

interface StepTextProps {
  step: Step;
  /** The detail pressed in this step, if any. */
  pressed: string | null;
  onPreview: (id: string | null) => void;
  onPress: (id: string) => void;
  journey: JourneyState;
  /** Whether a journey's trace shows here, in place of the details. */
  traceHere: boolean;
}

/**
 * One step's words: its name, heading and text, then its details (each
 * picks its part out of the drawing) and what Try it sends through it; once
 * Try it has, the trace and result take the details' place (so the words
 * keep about one height), until the reader asks for the details back.
 */
export function StepText({
  step,
  pressed,
  onPreview,
  onPress,
  journey,
  traceHere,
}: StepTextProps) {
  const own = traceHere && journey.shown === step.journey;
  return (
    <>
      <span className="mb-[6px] block text-[14px] font-medium text-muted">
        {step.kicker}
      </span>
      <h3 className="m-0 mb-[10px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.02em]">
        {step.heading}
      </h3>
      <p className="m-0 text-[17px] text-muted">{step.text}</p>
      {own ? (
        <JourneyTrace
          journey={journey}
          clearLabel="Show the details"
          className="mt-4"
        />
      ) : (
        <>
          <DetailList
            label={`Inside ${step.kicker.toLowerCase()}`}
            details={step.details}
            pressed={pressed}
            onPreview={onPreview}
            onPress={onPress}
          />
          <p className="m-0 mt-4 flex items-center gap-2 text-[14px] font-medium text-muted">
            <Glyph id="play" className="size-4 shrink-0 text-accent" />
            Try it: {journeyById(step.journey).label}
          </p>
        </>
      )}
    </>
  );
}
