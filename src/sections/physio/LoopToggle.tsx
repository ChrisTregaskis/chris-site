import { Button } from "@/ui/atoms/Button";
import { Icon } from "@/ui/atoms/Icon";
import { cn } from "@/lib/cn";

interface LoopToggleProps {
  /** The leak test is open (the last step): until then it's laid out but hidden. */
  live: boolean;
  looping: boolean;
  onToggle: () => void;
  className?: string;
}

/** The two labels, so the button can keep the width of the longer one. */
export const LOOP_LABEL = {
  off: "Loop the example",
  on: "Stop the loop",
} as const;

/** The line beside it: the other way to see the leak test. */
export const LOOP_HINT = "or try it yourself.";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Turns the leak test's example loop on and off, under the last step's
 * text. Nothing plays until the visitor asks. Its label and `aria-pressed`
 * follow the loop, which also stops when they use a button themselves or
 * scroll away. Both labels are laid out in one cell, so the button keeps
 * one width and nothing beside it reflows when it changes.
 */
export function LoopToggle({
  live,
  looping,
  onToggle,
  className,
}: LoopToggleProps) {
  return (
    <p
      data-testid="loop-toggle"
      aria-hidden={!live}
      className={cn(
        "m-0 flex flex-wrap items-center gap-x-3 text-[15px] text-muted transition-opacity duration-slow motion-reduce:transition-none",
        live ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
    >
      <Button
        variant="ghost"
        pressed={looping}
        onClick={onToggle}
        tabIndex={live ? 0 : -1}
        className="justify-start gap-2 py-[6px] text-left [@media(max-width:860px)_and_(max-height:700px)]:py-[3px]"
      >
        <Icon size={16}>
          {looping ? (
            <svg viewBox="0 0 16 16">
              <rect x="4" y="4" width="8" height="8" rx="1.5" {...stroke} />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16">
              <path d="M12.5 6.5A5 5 0 0 0 3.6 5" {...stroke} />
              <path d="M3.5 9.5A5 5 0 0 0 12.4 11" {...stroke} />
              <path d="M12.8 3v3.6H9.2M3.2 13V9.4h3.6" {...stroke} />
            </svg>
          )}
        </Icon>
        <span className="grid [&>*]:[grid-area:1/1]">
          {(["off", "on"] as const).map((state) => {
            const shown = (state === "on") === looping;
            return (
              <span
                key={state}
                aria-hidden={!shown}
                style={shown ? undefined : { visibility: "hidden" }}
              >
                {LOOP_LABEL[state]}
              </span>
            );
          })}
        </span>
      </Button>
      <span className="whitespace-nowrap">{LOOP_HINT}</span>
    </p>
  );
}
