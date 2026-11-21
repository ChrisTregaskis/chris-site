import { type KeyboardEvent, useRef, useState } from "react";
import { type Detail } from "./story";
import { cn } from "@/lib/cn";

interface DetailListProps {
  /** Names the list, e.g. "Inside the edge". */
  label: string;
  details: readonly Detail[];
  /** The detail pressed (picked out in the drawing), if one in this list is. */
  pressed: string | null;
  /** Pointing at or focusing a detail previews it in the drawing; null clears. */
  onPreview: (id: string | null) => void;
  /** Pressing a detail picks it out (again: puts it back). */
  onPress: (id: string) => void;
}

/**
 * A step's details: the readable twin of what it adds to the drawing, as
 * Wayfinder's "Inside" lists are (without numbers: the chapters are
 * numbered, the steps aren't). Each is a toggle that picks its part out in
 * amber; pointing at or focusing one previews it. One tab stop per list:
 * the arrow keys, Home and End move along it.
 */
export function DetailList({
  label,
  details,
  pressed,
  onPreview,
  onPress,
}: DetailListProps) {
  const [roving, setRoving] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, k: number) => {
    const last = details.length - 1;
    const to =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? Math.min(last, k + 1)
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? Math.max(0, k - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (to === null) return;
    event.preventDefault();
    buttons.current[to]?.focus();
  };

  return (
    <ul
      aria-label={label}
      data-no-select=""
      className="m-0 mt-4 grid list-none gap-y-[3px] p-0"
    >
      {details.map((detail, k) => {
        const on = pressed === detail.id;
        return (
          <li key={detail.id}>
            <button
              ref={(node) => {
                buttons.current[k] = node;
              }}
              type="button"
              tabIndex={k === roving ? 0 : -1}
              aria-pressed={on}
              onPointerEnter={() => onPreview(detail.id)}
              onPointerLeave={() => onPreview(null)}
              onFocus={() => {
                setRoving(k);
                onPreview(detail.id);
              }}
              onBlur={() => onPreview(null)}
              onClick={() => onPress(detail.id)}
              onKeyDown={(event) => onKeyDown(event, k)}
              className="group/detail flex cursor-pointer items-baseline gap-3 border-0 bg-transparent p-0 py-[2px] text-left font-body text-[15px] leading-[1.5]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block size-[7px] shrink-0 translate-y-[-1px] rounded-pill border-[1.5px] transition-colors duration-base motion-reduce:transition-none",
                  on
                    ? "border-signal bg-signal"
                    : "border-accent group-hover/detail:border-signal group-focus-visible/detail:border-signal",
                )}
              />
              <span
                className={cn(
                  "underline decoration-[1.5px] underline-offset-[5px] transition-[color,text-decoration-color] duration-base motion-reduce:transition-none",
                  on
                    ? "text-ink decoration-signal"
                    : "text-muted decoration-transparent group-hover/detail:text-ink group-hover/detail:decoration-line-field group-focus-visible/detail:text-ink",
                )}
              >
                {detail.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
