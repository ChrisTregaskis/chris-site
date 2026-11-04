import { type KeyboardEvent, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface InsidePiece {
  /** Its part number, e.g. "2.3". */
  id: string;
  name: string;
}

interface InsideListProps {
  /** The part's number, for the list's name. */
  n: number;
  pieces: readonly InsidePiece[];
  /** The piece pressed (picked out in the figure), if one in this list is. */
  pressed: string | null;
  /** Pointing at or focusing a piece previews it in the figure; null clears. */
  onPreview: (id: string | null) => void;
  /** Pressing a piece picks it out (again: puts it back). */
  onPress: (id: string) => void;
}

/**
 * A part's pieces, by number: the readable twin of the figure's tags (on
 * phones, where the figure is small, the main way to read them). Each is a
 * toggle that picks its piece out in the figure; pointing at or focusing one
 * previews it. One tab stop per list: the arrow keys, Home and End move
 * along it.
 */
export function InsideList({
  n,
  pieces,
  pressed,
  onPreview,
  onPress,
}: InsideListProps) {
  const [roving, setRoving] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, k: number) => {
    const last = pieces.length - 1;
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
    <ol
      aria-label={`Inside part ${n}`}
      data-no-select=""
      className="m-0 mt-4 grid list-none gap-y-[2px] p-0"
    >
      {pieces.map((piece, k) => {
        const on = pressed === piece.id;
        return (
          <li key={piece.id}>
            <button
              ref={(node) => {
                buttons.current[k] = node;
              }}
              type="button"
              tabIndex={k === roving ? 0 : -1}
              aria-pressed={on}
              onPointerEnter={() => onPreview(piece.id)}
              onPointerLeave={() => onPreview(null)}
              onFocus={() => {
                setRoving(k);
                onPreview(piece.id);
              }}
              onBlur={() => onPreview(null)}
              onClick={() => onPress(piece.id)}
              onKeyDown={(event) => onKeyDown(event, k)}
              className={cn(
                "group/piece flex cursor-pointer items-baseline gap-3 border-0 bg-transparent p-0 py-[1px] text-left font-body text-[14px] leading-[1.5]",
              )}
            >
              <span className="min-w-[2.1em] font-semibold tabular-nums text-accent">
                {piece.id}
              </span>
              <span
                className={cn(
                  "underline decoration-[1.5px] underline-offset-[5px] transition-[color,text-decoration-color] duration-base motion-reduce:transition-none",
                  on
                    ? "text-ink decoration-accent"
                    : "text-muted decoration-transparent group-hover/piece:text-ink group-hover/piece:decoration-line-field group-focus-visible/piece:text-ink",
                )}
              >
                {piece.name}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
