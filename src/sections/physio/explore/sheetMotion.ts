import { type Variants } from "framer-motion";
import { DURATION } from "@/ui/tokens/motion";

/*
 * Exploration: how a phone drawing's sheet moves. Only transform, opacity
 * and shadow change, so nothing on the page ever reflows (no layout shift).
 */
export const MOVE_3D =
  "transition-[transform,opacity,box-shadow] ease-lift motion-reduce:transition-none";

export interface SheetPlace {
  /** The sheet's transform in the scene (it's laid out at the scene's top left). */
  transform: string;
  /** Its transform origin, if not its top left. */
  origin?: string;
}

/**
 * A row's move: rows fold away quickly as a sheet is held back (or, `slow`,
 * fade as it goes, so they're seen going), and open once it has arrived.
 */
export function rowTransition(
  open: boolean,
  still: boolean,
  slow = false,
): string {
  if (still) return "none";
  const move = "transform var(--duration-together) var(--ease-lift)";
  if (open) {
    return `${move}, opacity var(--duration-slow) var(--ease-lift) var(--duration-state)`;
  }
  return slow
    ? `${move}, opacity var(--duration-together) linear var(--duration-state)`
    : `${move}, opacity var(--duration-fast) linear`;
}

/** Draft C: a held sheet's plate shows as it tips over, then hands over to its slab. */
export const TIPPING: Variants = {
  table: { opacity: 0 },
  result: { opacity: 1 },
  held: {
    opacity: [0, 1, 1, 0],
    transition: { duration: DURATION.apart, times: [0, 0.15, 0.7, 1] },
  },
};
