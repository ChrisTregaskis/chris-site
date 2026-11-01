export type ListboxKeyAction =
  | { type: "move"; index: number }
  | { type: "pick"; index: number }
  | { type: "close"; refocus: boolean };

/**
 * What a key press does in an open listbox of `count` options, with option
 * `active` highlighted: arrows wrap, Home and End jump, Enter and Space pick,
 * Escape closes back to the button, Tab closes and moves on, and a digit jumps
 * to that option (0 is the tenth). Anything else does nothing (null).
 */
export function listboxKey(
  key: string,
  active: number,
  count: number,
): ListboxKeyAction | null {
  const move = (index: number): ListboxKeyAction => ({
    type: "move",
    index: (index + count) % count,
  });
  switch (key) {
    case "ArrowDown":
      return move(active + 1);
    case "ArrowUp":
      return move(active - 1);
    case "Home":
      return move(0);
    case "End":
      return move(count - 1);
    case "Enter":
    case " ":
      return { type: "pick", index: active };
    case "Escape":
      return { type: "close", refocus: true };
    case "Tab":
      return { type: "close", refocus: false };
    default:
      break;
  }
  if (/^[0-9]$/.test(key)) {
    const n = key === "0" ? 10 : Number(key);
    if (n <= count) return move(n - 1);
  }
  return null;
}
