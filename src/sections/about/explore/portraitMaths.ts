/** Hermite smoothstep: 0 below `from`, 1 above `to`, eased between. */
export function smoothstep(from: number, to: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}
