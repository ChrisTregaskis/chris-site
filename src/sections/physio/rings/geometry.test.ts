import { describe, expect, it } from "vitest";
import {
  HALF,
  LABEL_UNITS,
  labelBox,
  LABELS,
  NODES,
  type NodeId,
  nodeRadius,
  R,
  ROUTE_KEYS,
  ROUTES,
} from "./geometry";
import { type XY } from "@/lib/polyline";

const near = (a: XY, b: XY, by = 0.5) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]) <= by;

const onRing = (p: XY, r: number) => Math.abs(Math.hypot(...p) - r) <= 0.5;

/** The shortest distance from the centre to a segment. */
function segmentReach([ax, ay]: XY, [bx, by]: XY): number {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(
    0,
    Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(ax + dx * t, ay + dy * t);
}

const NODE_IDS = Object.keys(NODES) as NodeId[];

describe("the rings' layout", () => {
  it("keeps its type at 13px or more on a 320px phone", () => {
    // Stacked, the drawing is as wide as the screen, but never taller than
    // 56% of it: on a 320 by 568 phone, 318px for 420 units.
    const drawn = Math.min(320, 0.56 * 568);
    expect(LABEL_UNITS * (drawn / (HALF * 2))).toBeGreaterThanOrEqual(13);
  });

  it("keeps every label inside the frame, clear of the others and of every node", () => {
    const boxes = LABELS.map(labelBox);
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(-HALF);
      expect(box.right).toBeLessThanOrEqual(HALF);
      expect(box.top).toBeGreaterThanOrEqual(-HALF);
      expect(box.bottom).toBeLessThanOrEqual(HALF);
    }
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b) => {
        const apart =
          a.right <= b.left ||
          b.right <= a.left ||
          a.bottom <= b.top ||
          b.bottom <= a.top;
        expect(apart).toBe(true);
      }),
    );
    for (const box of boxes) {
      for (const id of NODE_IDS) {
        const node = NODES[id];
        const r = nodeRadius(node.kind);
        if (node.kind === "ring" || node.kind === "centre") continue;
        const [x, y] = node.at;
        const nx = Math.max(box.left, Math.min(x, box.right));
        const ny = Math.max(box.top, Math.min(y, box.bottom));
        expect(Math.hypot(x - nx, y - ny), id).toBeGreaterThan(r);
      }
    }
  });

  it("never lets two nodes touch", () => {
    const drawn = NODE_IDS.filter(
      (id) => !["policy", "data"].includes(NODES[id].kind),
    );
    drawn.forEach((a, i) =>
      drawn.slice(i + 1).forEach((b) => {
        const gap =
          Math.hypot(
            NODES[a].at[0] - NODES[b].at[0],
            NODES[a].at[1] - NODES[b].at[1],
          ) -
          nodeRadius(NODES[a].kind) -
          nodeRadius(NODES[b].kind);
        expect(gap, `${a} and ${b}`).toBeGreaterThan(2);
      }),
    );
  });

  it("ends every route on something: a node, the orbit or the data's edge", () => {
    const ends = (p: XY) =>
      NODE_IDS.some((id) => near(p, NODES[id].at)) ||
      onRing(p, R.orbit) ||
      onRing(p, R.policy) ||
      onRing(p, R.data);
    for (const key of ROUTE_KEYS) {
      const points = ROUTES[key];
      expect(ends(points[0]), `${key} starts`).toBe(true);
      expect(ends(points[points.length - 1]), `${key} ends`).toBe(true);
    }
  });

  it("never runs a route through Postgres: they stop at its edge", () => {
    for (const key of ROUTE_KEYS) {
      const points = ROUTES[key];
      for (let i = 1; i < points.length; i++) {
        expect(
          segmentReach(points[i - 1], points[i]),
          key,
        ).toBeGreaterThanOrEqual(R.data - 0.5);
      }
    }
  });
});
