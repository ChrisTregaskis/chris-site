import { type ReactNode, useId } from "react";
import { useNumberedDropdown } from "./useNumberedDropdown";
import { cn } from "@/lib/cn";

export interface NumberedOption {
  /** 1-based; shown zero-padded in the badge unless `numeral` is given. */
  value: number;
  /** The number shown, when it isn't the value (a list that starts at 00). */
  numeral?: number;
  label: string;
  /** Draw a rule above this option (b3: before "Try it"). */
  separated?: boolean;
}

export interface NumberedDropdownProps {
  /** Names the control for assistive tech, e.g. "Wayfinder part". */
  label: string;
  options: NumberedOption[];
  /** The selected value, or 0 for none. */
  value: number;
  /** The selected option as text, read with the label. */
  valueText: string;
  onSelect: (value: number) => void;
  /** The button's visible content (b3: an odometer). Decorative. */
  children: ReactNode;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** The b3 part picker: a button that opens a numbered listbox above or below it. */
export function NumberedDropdown({
  label,
  options,
  value,
  valueText,
  onSelect,
  children,
}: NumberedDropdownProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const dropdown = useNumberedDropdown({
    count: options.length,
    numerals: options.map((option) => option.numeral ?? option.value),
    selectedIndex: options.findIndex((option) => option.value === value),
    onPick: (index) => onSelect(options[index].value),
  });

  return (
    <div
      ref={dropdown.rootRef}
      className="relative min-w-0 flex-auto wide:flex-[0_1_330px]"
    >
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <button
        ref={dropdown.buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={dropdown.open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={dropdown.onButtonClick}
        onKeyDown={dropdown.onButtonKeyDown}
        className="flex w-full cursor-pointer items-center gap-[10px] rounded-none border-0 border-b-2 border-line-field bg-transparent py-[5px] pl-0 pr-[10px] text-left font-display text-[18px] font-semibold leading-[normal] text-ink transition-colors duration-base hover:border-accent aria-expanded:border-accent motion-reduce:transition-none wide:gap-3 wide:py-[7px] wide:pr-[14px]"
      >
        <span id={valueId} className="sr-only">
          {valueText}
        </span>
        {children}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn(
            "size-[18px] flex-none text-muted transition-transform duration-base motion-reduce:transition-none",
            dropdown.open && "rotate-180",
          )}
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        ref={dropdown.listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        aria-activedescendant={
          dropdown.open ? optionId(dropdown.active) : undefined
        }
        tabIndex={-1}
        hidden={!dropdown.open}
        onKeyDown={dropdown.onListKeyDown}
        className={cn(
          "absolute inset-x-0 z-20 m-0 max-h-[min(420px,56vh)] list-none overflow-auto rounded-control bg-panel p-[6px] shadow-popover focus:outline-none wide:max-h-[min(440px,70vh)]",
          dropdown.placement === "up"
            ? "bottom-[calc(100%+8px)]"
            : "top-[calc(100%+8px)]",
        )}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={selected}
              onClick={() => dropdown.pick(index)}
              onMouseMove={() => {
                if (index !== dropdown.active) dropdown.setActive(index);
              }}
              className={cn(
                // The keyboard's place is a signal underline, not a fill.
                "flex cursor-pointer items-center gap-3 py-[6px] pl-[6px] pr-[10px] text-[15px] font-medium leading-[1.6] text-ink underline decoration-transparent decoration-[1.5px] underline-offset-[5px] hover:decoration-signal",
                selected && "font-semibold text-accent",
                index === dropdown.active && "decoration-signal",
                option.separated &&
                  "mt-1 rounded-t-none border-t border-line pt-2",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block min-w-[2.2em] flex-none font-display text-[15px] font-bold tabular-nums",
                  selected ? "text-accent" : "text-muted",
                )}
              >
                {pad2(option.numeral ?? option.value)}
              </span>
              {option.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
