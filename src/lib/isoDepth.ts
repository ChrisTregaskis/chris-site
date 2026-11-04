/**
 * Painter's ordering for axis-aligned boxes drawn in the site's isometric
 * projection, where the viewer looks along (1, 1, 1): more x, more y or more
 * z is nearer. SVG has no depth buffer, so anything that moves in 3D has to
 * be re-sorted back to front as it moves.
 *
 * Two boxes only need an order when their drawings overlap. In this
 * projection a box's outline is a hexagon whose edges run along the three
 * projected axes, so two outlines overlap exactly when their ranges of
 * x − y, y − z and x − z all overlap. When they do, the pair is ordered by
 * a separating plane (one ends before the other begins on some axis); two
 * disjoint boxes always have one, and when their drawings overlap every
 * separating plane gives the same answer. Boxes that interpenetrate have no
 * correct order: callers should never produce them (the Wayfinder figure
 * pins that with a test).
 */

export interface Aabb {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
}

const overlaps = (aLo: number, aHi: number, bLo: number, bHi: number) =>
  aLo < bHi && bLo < aHi;

/** Whether two boxes' isometric drawings overlap (touching does not count). */
export function drawingsOverlap(a: Aabb, b: Aabb): boolean {
  return (
    overlaps(a.x0 - a.y1, a.x1 - a.y0, b.x0 - b.y1, b.x1 - b.y0) &&
    overlaps(a.y0 - a.z1, a.y1 - a.z0, b.y0 - b.z1, b.y1 - b.z0) &&
    overlaps(a.x0 - a.z1, a.x1 - a.z0, b.x0 - b.z1, b.x1 - b.z0)
  );
}

/** Whether two boxes share volume (so neither can be drawn first correctly). */
export function interpenetrate(a: Aabb, b: Aabb, slack = 0): boolean {
  return (
    a.x0 < b.x1 - slack &&
    b.x0 < a.x1 - slack &&
    a.y0 < b.y1 - slack &&
    b.y0 < a.y1 - slack &&
    a.z0 < b.z1 - slack &&
    b.z0 < a.z1 - slack
  );
}

/**
 * Whether `a` is behind `b` along a separating plane, so must be drawn first.
 * Null when no axis separates them.
 */
export function behind(a: Aabb, b: Aabb): boolean | null {
  if (a.x1 <= b.x0 || a.y1 <= b.y0 || a.z1 <= b.z0) return true;
  if (b.x1 <= a.x0 || b.y1 <= a.y0 || b.z1 <= a.z0) return false;
  return null;
}

const depth = (box: Aabb) =>
  box.x0 + box.x1 + box.y0 + box.y1 + box.z0 + box.z1;

/**
 * Indexes of `boxes` in paint order, back to front. Only pairs whose drawings
 * overlap constrain the order; everything else keeps its given order (so the
 * result is stable, and a re-sort mid-animation moves as little as possible).
 * A cycle (which disjoint boxes of sensible proportions do not make) is
 * broken by depth rather than looping.
 */
export function paintOrder(boxes: readonly Aabb[]): number[] {
  const n = boxes.length;
  const after: number[][] = boxes.map(() => []);
  const blockers = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!drawingsOverlap(boxes[i], boxes[j])) continue;
      const first =
        behind(boxes[i], boxes[j]) ?? depth(boxes[i]) <= depth(boxes[j]);
      const [back, front] = first ? [i, j] : [j, i];
      after[back].push(front);
      blockers[front] += 1;
    }
  }

  const order: number[] = [];
  const done = new Array<boolean>(n).fill(false);
  while (order.length < n) {
    // The earliest given box with nothing left behind it; on a cycle, the
    // deepest remaining box.
    let next = -1;
    for (let i = 0; i < n; i++) {
      if (!done[i] && blockers[i] === 0) {
        next = i;
        break;
      }
    }
    if (next === -1) {
      for (let i = 0; i < n; i++) {
        if (!done[i] && (next === -1 || depth(boxes[i]) < depth(boxes[next]))) {
          next = i;
        }
      }
    }
    done[next] = true;
    order.push(next);
    for (const front of after[next]) blockers[front] -= 1;
  }
  return order;
}
