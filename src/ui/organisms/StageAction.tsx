import { type StepPickerProps } from "./StepPicker";
import { Button } from "@/ui/atoms/Button";
import { cn } from "@/lib/cn";

interface StageActionProps {
  /** The same action the step picker carries beside it (b3 "Try it"). */
  action: StepPickerProps["action"];
  /** Where it sits on the stage (the stage must be positioned). */
  className?: string;
}

/**
 * A scroll story's action without its picker: the red pen's filled button,
 * a size down, pinned to the bottom-right corner of the drawing's stage, in
 * room the drawing leaves empty (the compact phone stage). Drawn smaller,
 * it still takes a 44px press: its hit area reaches past it, top and bottom.
 */
export function StageAction({ action, className }: StageActionProps) {
  return (
    <Button
      size="sm"
      pressed={action.pressed}
      onClick={action.onClick}
      className={cn(
        "absolute right-0 z-[1] px-2 before:absolute before:inset-x-0 before:-inset-y-[5px] before:content-['']",
        className,
      )}
    >
      {action.label}
    </Button>
  );
}
