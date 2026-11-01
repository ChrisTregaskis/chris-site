import { describe, expect, it } from "vitest";
import { pointAlong, polylineLength } from "./polyline";

const L = [
  [0, 0],
  [30, 0],
  [30, 40],
] as const;

describe("polyline", () => {
  it("measures every segment", () => {
    expect(polylineLength(L)).toBe(70);
    expect(polylineLength([[5, 5]])).toBe(0);
  });

  it("finds the point a distance along it, clamped to the ends", () => {
    expect(pointAlong(L, 15)).toEqual([15, 0]);
    expect(pointAlong(L, 50)).toEqual([30, 20]);
    expect(pointAlong(L, -5)).toEqual([0, 0]);
    expect(pointAlong(L, 999)).toEqual([30, 40]);
  });
});
