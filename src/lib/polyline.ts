export type XY = readonly [number, number];

/** Total length of a polyline. */
export function polylineLength(points: readonly XY[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1],
    );
  }
  return total;
}

/** The point `distance` along a polyline, clamped to its ends. */
export function pointAlong(points: readonly XY[], distance: number): XY {
  let left = Math.max(0, distance);
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const length = Math.hypot(bx - ax, by - ay);
    if (left <= length && length > 0) {
      const t = left / length;
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    left -= length;
  }
  return points[points.length - 1];
}
