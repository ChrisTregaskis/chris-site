import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { listboxKey } from "./listboxKeys";

export type DropdownPlacement = "up" | "down";

interface UseNumberedDropdownOptions {
  count: number;
  /** Index of the selected option, or -1 when none is. */
  selectedIndex: number;
  onPick: (index: number) => void;
}

/**
 * Behaviour of a button that opens a listbox (the b3 part picker): keyboard
 * per the ARIA listbox pattern, a click outside closes it, and it opens
 * upwards when there isn't room below.
 */
export function useNumberedDropdown({
  count,
  selectedIndex,
  onPick,
}: UseNumberedDropdownOptions) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<DropdownPlacement>("down");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const show = useCallback(
    (offset = 0) => {
      const start = selectedIndex >= 0 ? selectedIndex : 0;
      setActive((start + offset + count) % count);
      setOpen(true);
    },
    [count, selectedIndex],
  );

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const pick = useCallback(
    (index: number) => {
      close(true);
      onPick(index);
    },
    [close, onPick],
  );

  // Once open: choose a side with room, and take focus into the list.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !listRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const below = window.innerHeight - button.bottom;
    const needed = listRef.current.offsetHeight + 16;
    setPlacement(below < needed && button.top > below ? "up" : "down");
    listRef.current.focus({ preventScroll: true });
  }, [open]);

  // Keep the highlighted option in view as it moves.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  // A press anywhere outside closes it, leaving focus where it went.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  const onButtonClick = () => (open ? close(true) : show());

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (!open) show(event.key === "ArrowUp" ? -1 : 0);
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const action = listboxKey(event.key, active, count);
    if (!action) return;
    if (event.key !== "Tab") event.preventDefault();
    if (action.type === "move") setActive(action.index);
    else if (action.type === "pick") pick(action.index);
    else close(action.refocus);
  };

  return {
    open,
    active,
    placement,
    rootRef,
    buttonRef,
    listRef,
    setActive,
    pick,
    onButtonClick,
    onButtonKeyDown,
    onListKeyDown,
  };
}
