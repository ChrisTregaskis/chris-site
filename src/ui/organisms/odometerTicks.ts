/**
 * The b3 odometer ticks through every number between the one shown and the
 * target, one at a time: slower for a short hop, faster for a long one, so a
 * jump of any length takes about half a second.
 */
export function odometerTickMs(remaining: number): number {
  return Math.max(55, Math.min(90, 480 / Math.max(1, remaining)));
}

/** The next number on the way to the target (the target itself when there). */
export function odometerNext(shown: number, target: number): number {
  if (shown === target) return shown;
  return shown + (target > shown ? 1 : -1);
}
