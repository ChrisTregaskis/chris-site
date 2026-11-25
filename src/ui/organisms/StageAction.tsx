import { type StepPickerProps } from "./StepPicker";
import { Button } from "@/ui/atoms/Button";
import { cn } from "@/lib/cn";

interface StageActionProps {
  /** The same action the step picker carries beside it (b3 "Try it"). */
  action: StepPickerProps["action"];
  /** Where it sits on the stage (the stage must be positioned). */
  className?: string;
  /**
   * Whether it's on the stage yet. Hidden, it's see-through and can't be
   * pressed or reached (inert), so it arrives with the drawing rather than
   * floating over empty paper.
   */
  shown?: boolean;
  /** How long it takes to fade in and out (ms), to keep time with the drawing. */
  fadeMs?: { in: number; out: number };
}

/**
 * A scroll story's action without its picker: the red pen's filled button,
 * a size down, pinned to the bottom-right corner of the drawing's stage, in
 * room the drawing leaves empty (the compact phone stage). Drawn smaller,
 * it still takes a 44px press: its hit area reaches past it, top and bottom.
 */
export function StageAction({
  action,
  className,
  shown = true,
  fadeMs = { in: 0, out: 0 },
}: StageActionProps) {
  return (
    <Button
      size="sm"
      pressed={action.pressed}
      onClick={action.onClick}
      aria-hidden={shown ? undefined : true}
      // React 18 types inert as a string; "" sets it, undefined leaves it off.
      {...{ inert: shown ? undefined : "" }}
      // The button's own transition (background-color, box-shadow, opacity):
      // the press keeps its pace, the fade takes the drawing's.
      style={{
        transitionDuration: `var(--duration-base), var(--duration-base), ${shown ? fadeMs.in : fadeMs.out}ms`,
      }}
      className={cn(
        "absolute right-0 z-[1] px-2 before:absolute before:inset-x-0 before:-inset-y-[5px] before:content-['']",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
    >
      {action.label}
    </Button>
  );
}
