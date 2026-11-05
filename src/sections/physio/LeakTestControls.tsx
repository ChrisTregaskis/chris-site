import { type FocusEvent } from "react";
import { type LoopMove } from "./demo";
import { type Org } from "./organisations";
import { LOOP_PRESSED, PRESSABLE } from "./pressable";
import { cn } from "@/lib/cn";

interface LeakTestControlsProps {
  /** The leak test is open (the last step). */
  live: boolean;
  target: Org;
  asking: boolean;
  onTry: () => void;
  onReset: () => void;
  /** The button the example loop is pressing, if any. */
  pressing?: LoopMove | null;
  /** One button at a time (phones): Try, or while asking, ask for every session again. */
  single?: boolean;
  focusProps?: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
  };
  className?: string;
}

/** Try to read another organisation's sessions, and ask for every session again. */
export function LeakTestControls({
  live,
  target,
  asking,
  onTry,
  onReset,
  pressing = null,
  single = false,
  focusProps,
  className,
}: LeakTestControlsProps) {
  return (
    <div
      {...focusProps}
      className={cn(
        "relative z-[1] flex min-h-[30px] flex-wrap items-baseline gap-x-5 gap-y-2 text-[15px] transition-opacity duration-slow motion-reduce:transition-none",
        live ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      aria-hidden={!live}
    >
      {single && asking ? null : (
        <button
          type="button"
          tabIndex={live ? 0 : -1}
          onClick={onTry}
          className={cn(
            "border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent",
            PRESSABLE,
            pressing?.kind === "try" && LOOP_PRESSED,
          )}
        >
          Try to read {target}&rsquo;s sessions
        </button>
      )}
      {/*
       * Beside the steps it's always laid out, and only shown while asking,
       * so the row wraps the same way in every state (in a narrow column a
       * row that wrapped only while asking moved the whole figure).
       */}
      {asking || !single ? (
        <button
          type="button"
          tabIndex={live && asking ? 0 : -1}
          onClick={onReset}
          style={asking ? undefined : { visibility: "hidden" }}
          className={cn(
            single
              ? "border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent"
              : "border-0 bg-transparent p-0 text-muted underline-offset-4 hover:text-ink hover:underline",
            PRESSABLE,
            pressing?.kind === "reset" &&
              cn(LOOP_PRESSED, single ? undefined : "text-ink"),
          )}
        >
          Ask for every session again
        </button>
      ) : null}
    </div>
  );
}
