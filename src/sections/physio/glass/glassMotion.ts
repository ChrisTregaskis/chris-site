import { type Variants } from "framer-motion";
import { DURATION } from "@/ui/tokens/motion";

/*
 * How the glass floor's pieces move. Only transform, opacity and shadow
 * change, so nothing on the page ever reflows (no layout shift).
 */
export const MOVE_3D =
  "transition-[transform,opacity,box-shadow] ease-lift motion-reduce:transition-none";

/**
 * A row's move: rows fade as a sheet tips over (so they're seen going),
 * and open once a sheet has arrived.
 */
export function rowTransition(open: boolean, still: boolean): string {
  if (still) return "none";
  const move = "transform var(--duration-together) var(--ease-lift)";
  return open
    ? `${move}, opacity var(--duration-slow) var(--ease-lift) var(--duration-state)`
    : `${move}, opacity var(--duration-together) linear var(--duration-state)`;
}

/** A held sheet's plate shows as it tips over, then hands over to its slab under the glass. */
export const TIPPING: Variants = {
  table: { opacity: 0 },
  result: { opacity: 1 },
  held: {
    opacity: [0, 1, 1, 0],
    transition: { duration: DURATION.apart, times: [0, 0.15, 0.7, 1] },
  },
};
