/**
 * The maths behind in-page anchor scrolls. A long page of pinned and
 * scroll-driven stories makes a native smooth scroll from top to bottom slow
 * and chaotic (every story plays on the way past), so a far jump cuts to
 * within one reach of the target and glides only that last stretch.
 */

/** How far a glide travels at most, as a share of the viewport's height. */
export const GLIDE_REACH = 0.85;

export interface GlidePlan {
  /** Where to cut to first, instantly; null when the target is within reach. */
  jump: number | null;
  /** Where the glide starts (the jump, or where the page already is). */
  start: number;
  /** How long the glide takes, in ms. */
  duration: number;
}

/**
 * Plan the scroll from `from` to `to` (both scroll offsets, px): cut to one
 * reach short of the target on the side the page is coming from, then glide.
 * The glide's duration grows with its length, between `minMs` and `maxMs`.
 */
export function glidePlan(
  from: number,
  to: number,
  viewportHeight: number,
  minMs: number,
  maxMs: number,
): GlidePlan {
  const reach = viewportHeight * GLIDE_REACH;
  const distance = to - from;
  const far = Math.abs(distance) > reach;
  const start = far ? to - Math.sign(distance) * reach : from;
  const share = reach > 0 ? Math.min(1, Math.abs(to - start) / reach) : 0;
  return {
    jump: far ? start : null,
    start,
    duration: Math.round(minMs + (maxMs - minMs) * share),
  };
}

/** Fast out, gentle landing. */
export function easeOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - (1 - clamped) ** 3;
}
