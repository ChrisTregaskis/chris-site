import { DetailList } from "./DetailList";
import { JourneyTrace } from "./JourneyTrace";
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
 * picks its part out of the drawing); once Try it has sent the step's
 * journey, the trace and result take the details' place (in the same cell,
 * so the words never get shorter), until the reader asks for them back.
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
      <span className="mb-2 block text-[14px] font-medium text-muted">
        {step.kicker}
      </span>
      <h3 className="m-0 mb-3 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.01em]">
        {step.heading}
      </h3>
      <p className="m-0 text-[17px] text-muted">{step.text}</p>
      {/* The trace takes the details' place in the same cell, so the words
          never get shorter on Try it (which, on a short phone, would slide
          the next step under the reading line and end the journey). */}
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <div
          aria-hidden={own || undefined}
          className={own ? "invisible" : undefined}
        >
          <DetailList
            label={`Inside ${step.kicker.toLowerCase()}`}
            details={step.details}
            pressed={pressed}
            onPreview={onPreview}
            onPress={onPress}
          />
        </div>
        {own ? (
          <JourneyTrace
            journey={journey}
            clearLabel="Show the details"
            className="mt-4"
          />
        ) : null}
      </div>
    </>
  );
}
