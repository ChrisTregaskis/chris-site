/**
 * A small tween over requestAnimationFrame: one number from `from` to `to`,
 * eased, reporting each frame. It stands in for Framer Motion's imperative
 * `animate` where only a value is needed (no styles, no springs), which keeps
 * that part of Framer out of the bundle.
 */

export type Easing = (t: number) => number;

export const linear: Easing = (t) => t;

/**
 * CSS's `cubic-bezier(x1, y1, x2, y2)` as a function of progress (0 to 1):
 * solves the curve's x for t (Newton's method, falling back to bisection),
 * then reads its y.
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Easing {
  // Each coordinate is a cubic in s with these coefficients (P0 = 0, P3 = 1).
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const xAt = (s: number) => ((ax * s + bx) * s + cx) * s;
  const yAt = (s: number) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;

  const solve = (x: number) => {
    let s = x;
    for (let i = 0; i < 8; i++) {
      const error = xAt(s) - x;
      if (Math.abs(error) < 1e-6) return s;
      const slope = slopeX(s);
      if (Math.abs(slope) < 1e-6) break;
      s -= error / slope;
    }
    let lo = 0;
    let hi = 1;
    s = x;
    for (let i = 0; i < 30 && hi - lo > 1e-7; i++) {
      if (xAt(s) < x) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return s;
  };

  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return yAt(solve(t));
  };
}

export interface TweenOptions {
  from: number;
  to: number;
  /** Milliseconds; 0 or less jumps straight to `to`. */
  duration: number;
  ease?: Easing;
  onUpdate: (value: number) => void;
  onDone?: () => void;
}

/**
 * Runs a tween and returns a function that stops it where it is (`onDone`
 * is not called). The first update lands on the next frame.
 */
export function tween({
  from,
  to,
  duration,
  ease = linear,
  onUpdate,
  onDone,
}: TweenOptions): () => void {
  if (duration <= 0) {
    onUpdate(to);
    onDone?.();
    return () => {};
  }
  let frame = 0;
  let start: number | null = null;
  const step = (now: number) => {
    start ??= now;
    const progress = Math.min(1, (now - start) / duration);
    onUpdate(from + (to - from) * ease(progress));
    if (progress < 1) {
      frame = requestAnimationFrame(step);
      return;
    }
    frame = 0;
    onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
}
