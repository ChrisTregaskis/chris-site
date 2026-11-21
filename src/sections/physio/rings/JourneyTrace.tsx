import { Glyph } from "./glyphs";
import { type JourneyState } from "./useJourney";
import { cn } from "@/lib/cn";

/** The trace's speaker column: wide enough for the longest name. */
const WHO = 9;

interface JourneyTraceProps {
  journey: JourneyState;
  /** The link that clears the journey, and what it says it brings back. */
  clearLabel: string;
  className?: string;
}

/**
 * Where a journey went, line by line, how it ended, and a link that clears
 * it (and everything it lit in the drawing).
 */
export function JourneyTrace({
  journey,
  clearLabel,
  className,
}: JourneyTraceProps) {
  return (
    <div className={className}>
      <pre
        aria-label="Trace"
        className="m-0 whitespace-pre-wrap font-code text-mono-sm text-muted [overflow-wrap:anywhere]"
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
        {clearLabel}
      </button>
    </div>
  );
}
