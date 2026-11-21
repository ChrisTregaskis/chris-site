import { DetailList } from "./DetailList";
import { Glyph } from "./glyphs";
import { journeyById } from "./journeys";
import { type Step } from "./story";
import { type JourneyState } from "./useJourney";
import { cn } from "@/lib/cn";

interface StepTextProps {
  step: Step;
  /** The detail pressed in this step, if any. */
  pressed: string | null;
  onPreview: (id: string | null) => void;
  onPress: (id: string) => void;
  journey: JourneyState;
}

/** The trace's speaker column: wide enough for the longest name. */
const WHO = 9;

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
}: StepTextProps) {
  const own = journey.shown === step.journey;
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
        <>
          <pre
            aria-label="Trace"
            className="mb-0 mt-4 whitespace-pre-wrap font-code text-mono-sm text-muted [overflow-wrap:anywhere]"
          >
            {journey.trace.map((line, index) => (
              <span key={index}>
                {index > 0 ? "\n" : ""}
                <b className="font-semibold text-ink">{line.who}</b>
                {" ".repeat(Math.max(1, WHO - line.who.length))}
                {line.text}
              </span>
            ))}
          </pre>
          {journey.result ? (
            <p className="m-0 mt-3 flex items-center gap-2 text-[15px] font-semibold">
              <Glyph
                id={journey.result.held ? "blocked" : "check"}
                className={cn(
                  "size-[18px] shrink-0",
                  journey.result.held ? "text-danger-ink" : "text-accent",
                )}
              />
              <span
                className={journey.result.held ? "text-danger-ink" : "text-ink"}
              >
                {journey.result.text}
              </span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={journey.cancel}
            className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-[14px] font-semibold text-ink underline decoration-accent decoration-[1.5px] underline-offset-[6px]"
          >
            Show the details
          </button>
        </>
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
