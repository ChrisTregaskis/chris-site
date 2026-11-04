import { type FocusEvent } from "react";
import { type DemoMove } from "./demo";
import { type Org } from "./organisations";
import { DEMO_PRESSED, PRESSABLE } from "./pressable";
import { cn } from "@/lib/cn";

interface LeakTestControlsProps {
  /** The leak test is open (the last step). */
  live: boolean;
  target: Org;
  asking: boolean;
  onTry: () => void;
  onReset: () => void;
  /** The button the demo is pressing, if any. */
  pressing?: DemoMove | null;
  /** The demo can play: offer to pause or play it. */
  demo?: boolean;
  paused?: boolean;
  onPause?: () => void;
  onPlay?: () => void;
  focusProps?: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
  className?: string;
}

/** Try to read another organisation's sessions, ask for every session again, and pause or play the demo. */
export function LeakTestControls({
  live,
  target,
  asking,
  onTry,
  onReset,
  pressing = null,
  demo = false,
  paused = false,
  onPause,
  onPlay,
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
      <button
        type="button"
        tabIndex={live ? 0 : -1}
        onClick={onTry}
        className={cn(
          "border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent",
          PRESSABLE,
          pressing?.kind === "try" && DEMO_PRESSED,
        )}
      >
        Try to read {target}&rsquo;s sessions
      </button>
      {asking ? (
        <button
          type="button"
          tabIndex={live ? 0 : -1}
          onClick={onReset}
          className={cn(
            "border-0 bg-transparent p-0 text-muted underline-offset-4 hover:text-ink hover:underline",
            PRESSABLE,
            pressing?.kind === "reset" && cn(DEMO_PRESSED, "text-ink"),
          )}
        >
          Ask for every session again
        </button>
      ) : null}
      {demo ? (
        <button
          type="button"
          tabIndex={live ? 0 : -1}
          onClick={paused ? onPlay : onPause}
          className="ml-auto flex items-center gap-[6px] border-0 bg-transparent p-0 text-[14px] text-muted hover:text-ink"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            className="size-[9px] fill-current"
          >
            {paused ? (
              <path d="M2 1l7 4-7 4z" />
            ) : (
              <path d="M2 1h2v8H2zM6 1h2v8H6z" />
            )}
          </svg>
          {paused ? "Play demo" : "Pause demo"}
        </button>
      ) : null}
    </div>
  );
}
