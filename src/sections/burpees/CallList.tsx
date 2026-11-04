import { CALLS } from "./calls";
import { CALL_TYPE, LINE_TYPE } from "./countType";
import { cn } from "@/lib/cn";

/** Every call but Done, which comes in under the count instead. */
const CALLING = CALLS.slice(0, -1);

interface CallListProps {
  /** The call last made (its index in CALLS). */
  called: number;
  /** Beside the count (wide screens with room), or under it. */
  beside: boolean;
  /** How far to step right, clear of a count drawn wider than its column, in px. */
  push: number;
  /** The set is done: the list fades out for Done. */
  done: boolean;
}

/**
 * The calls made so far: the latest large with its line of the story, the
 * earlier ones small above it. Beside the count they stack up from its
 * baseline; under it (phones, or a count drawn too wide for the calls'
 * column) they run along one line. Each call is drawn whole, earlier calls
 * and all, in the same spot, and only the latest shows, so a new call
 * crossfades in and the list keeps one height all set long: nothing around
 * it moves.
 */
export function CallList({ called, beside, push, done }: CallListProps) {
  const latest = Math.min(called, CALLING.length - 1);
  return (
    <div
      className={cn(
        "relative z-[1] transition-[opacity,visibility] duration-slow ease-enter motion-reduce:transition-none",
        beside
          ? "col-start-2 row-start-1"
          : "col-start-1 row-start-3 mt-[clamp(16px,3svh,40px)]",
        done && "invisible opacity-0",
      )}
    >
      <div
        className={cn(
          "grid",
          beside ? "absolute bottom-0 right-0 items-end" : "items-start",
        )}
        style={beside ? { left: push } : undefined}
      >
        {CALLING.map((item, index) => (
          <div
            key={item.call}
            className={cn(
              "transition-[opacity,visibility] duration-base ease-enter [grid-area:1/1] motion-reduce:transition-none",
              index !== latest && "invisible opacity-0",
            )}
          >
            <ol
              className={cn(
                "m-0 list-none p-0 font-display font-semibold tracking-[-0.02em] text-muted",
                beside
                  ? "text-[20px] leading-[1.05]"
                  : "mb-2 flex min-h-[1.5em] flex-wrap gap-x-4 text-body-sm",
              )}
            >
              {CALLING.slice(0, index).map((earlier) => (
                <li key={earlier.call} className={beside ? "mb-3" : undefined}>
                  {earlier.call}
                </li>
              ))}
            </ol>
            <p className={CALL_TYPE}>{item.call}</p>
            <p className={LINE_TYPE}>{item.line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
