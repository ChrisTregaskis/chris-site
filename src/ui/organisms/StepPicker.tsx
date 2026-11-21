import { type ReactNode } from "react";
import { NumberedDropdown, type NumberedOption } from "./NumberedDropdown";
import { Odometer } from "./Odometer";
import { Button } from "@/ui/atoms/Button";

export interface StepPickerProps {
  /** Names the picker for assistive tech, e.g. "Wayfinder part". */
  label: string;
  options: NumberedOption[];
  /** The selected step, or 0 for none yet. */
  value: number;
  /** The step the odometer shows (the first, before any is selected). */
  shown: number;
  /** The shown step as text, read with the label. */
  valueText: string;
  onSelect: (value: number) => void;
  reducedMotion: boolean;
  /** What leads a step's name in the button: its number, or an icon. */
  marker: (value: number) => ReactNode;
  /** A step's name. */
  name: (value: number) => string;
  /** The filled button beside the picker (b3 "Try it"). */
  action: { label: string; pressed: boolean; onClick: () => void };
  /** A quieter link under the row (Wayfinder: take it apart); none to leave it out. */
  toggle?: { label: string; glyph: ReactNode; onClick: () => void } | null;
}

/**
 * A scroll story's picker, as the Wayfinder chapter draws it: an underlined
 * row naming the step (rolling to each new one), a listbox of every step, a
 * filled button beside it, and an optional link under them.
 */
export function StepPicker({
  label,
  options,
  value,
  shown,
  valueText,
  onSelect,
  reducedMotion,
  marker,
  name,
  action,
  toggle,
}: StepPickerProps) {
  return (
    <>
      <div className="flex w-full items-stretch justify-center gap-[10px]">
        <NumberedDropdown
          label={label}
          options={options}
          value={value}
          valueText={valueText}
          onSelect={onSelect}
        >
          <Odometer
            value={shown}
            reducedMotion={reducedMotion}
            className="h-8 min-w-0 flex-1 wide:h-[34px]"
            renderItem={(n) => (
              <>
                <span className="inline-grid h-8 flex-none place-items-center font-code text-[17px] font-medium tabular-nums text-ink wide:h-[34px] [&>svg]:size-[22px]">
                  {marker(n)}
                </span>
                <span className="overflow-hidden text-ellipsis">{name(n)}</span>
              </>
            )}
          />
        </NumberedDropdown>
        <Button
          pressed={action.pressed}
          onClick={action.onClick}
          className="flex-none rounded-control px-4 py-0 wide:px-5"
        >
          {action.label}
        </Button>
      </div>
      {toggle ? (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={toggle.onClick}
            className="gap-2 text-[14px] [&>svg]:size-4 [&>svg]:text-muted"
          >
            {toggle.glyph}
            {toggle.label}
          </Button>
        </div>
      ) : null}
    </>
  );
}
