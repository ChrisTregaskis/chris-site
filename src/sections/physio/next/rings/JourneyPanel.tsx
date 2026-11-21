import { type GlyphId, Glyph } from "./glyphs";
import { type JourneyId, JOURNEYS, type TraceLine } from "./journeys";
import { type JourneyResult } from "./useJourney";
import { cn } from "@/lib/cn";

const ICONS: Record<JourneyId, GlyphId> = {
  own: "person",
  cross: "blocked",
  video: "film",
  job: "clock",
  admin: "eye",
};

interface JourneyPanelProps {
  running: JourneyId | null;
  last: JourneyId | null;
  trace: readonly TraceLine[];
  result: JourneyResult | null;
  onRun: (id: JourneyId) => void;
}

/** The trace's speaker column: wide enough for the longest name. */
const WHO = 9;

/**
 * The journeys a visitor can send through the rings, the trace of where
 * each one went, and how it ended. One at a time: while one runs, the
 * others wait (and say so). Nothing runs by itself.
 */
export function JourneyPanel({
  running,
  last,
  trace,
  result,
  onRun,
}: JourneyPanelProps) {
  return (
    <div data-no-select="" className="mt-4">
      <div
        role="group"
        aria-label="Journeys"
        className="grid gap-x-6 gap-y-[6px] sheet:grid-cols-2"
      >
        {JOURNEYS.map((journey) => {
          const on = journey.id === (running ?? last);
          const waiting = running !== null && running !== journey.id;
          return (
            <button
              key={journey.id}
              type="button"
              aria-pressed={on}
              aria-disabled={waiting || undefined}
              onClick={() => {
                if (!waiting) onRun(journey.id);
              }}
              className={cn(
                "group/journey flex cursor-pointer items-center gap-[10px] border-0 bg-transparent px-0 py-[7px] text-left text-[15px] font-semibold leading-[normal] transition-colors duration-base motion-reduce:transition-none",
                on ? "text-ink" : "text-muted hover:text-ink",
                waiting && "cursor-default",
              )}
            >
              <Glyph
                id={ICONS[journey.id]}
                className={cn(
                  "size-5 shrink-0 transition-colors duration-base motion-reduce:transition-none",
                  journey.id === running
                    ? "text-signal"
                    : on
                      ? "text-accent"
                      : "text-accent/70",
                )}
              />
              <span
                className={cn(
                  "underline decoration-[1.5px] underline-offset-[6px]",
                  on
                    ? "decoration-accent decoration-solid"
                    : "decoration-line-field decoration-dotted group-hover/journey:decoration-accent",
                )}
              >
                {journey.label}
              </span>
            </button>
          );
        })}
      </div>
      <pre
        aria-label="Trace"
        className="mb-0 mt-4 min-h-[8.2em] whitespace-pre-wrap font-code text-mono-sm text-muted [overflow-wrap:anywhere]"
      >
        {trace.length === 0
          ? "Pick a journey to see where it goes."
          : trace.map((line, index) => (
              <span key={index}>
                {index > 0 ? "\n" : ""}
                <b className="font-semibold text-ink">{line.who}</b>
                {" ".repeat(Math.max(1, WHO - line.who.length))}
                {line.text}
              </span>
            ))}
      </pre>
      <p
        aria-live="polite"
        className="m-0 mt-3 flex min-h-[1.6em] items-center gap-2 text-[15px] font-semibold"
      >
        {result ? (
          <>
            <Glyph
              id={result.held ? "blocked" : "check"}
              className={cn(
                "size-[18px] shrink-0",
                result.held ? "text-danger-ink" : "text-accent",
              )}
            />
            <span className={result.held ? "text-danger-ink" : "text-ink"}>
              {result.text}
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
