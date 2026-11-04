import { type CSSProperties } from "react";

/**
 * How the sheets move between spots: CSS transitions on the tokens, none
 * under reduced motion (the same states, instantly).
 */
export const MOVE =
  "transition-[transform,opacity,height,box-shadow] ease-lift motion-reduce:transition-none";

/** A slow move, staggered by `index` (0 first). */
export function apartTiming(index: number): CSSProperties {
  return {
    transitionDuration: "var(--duration-apart)",
    transitionDelay: `calc(var(--stagger-base) * ${index})`,
  };
}

/** Keyframe times for an attempt hitting the policy: the peak lines up with the policy's flash. */
export const HIT_TIMES = [0, 0.32, 0.62, 0.8, 1];

/** The policy's flash as an attempt hits it. */
export const FLASH_TIMES = [0, 0.3, 0.42, 1];
