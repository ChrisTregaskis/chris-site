import { describe, expect, it } from "vitest";
import {
  type Aabb,
  behind,
  drawingsOverlap,
  interpenetrate,
  paintOrder,
} from "./isoDepth";

const cube = (x: number, y: number, z: number, size = 10): Aabb => ({
  x0: x,
  x1: x + size,
  y0: y,
  y1: y + size,
  z0: z,
  z1: z + size,
});

describe("isoDepth", () => {
  it("knows two boxes' drawings overlap when one stands in front of the other", () => {
    // Along the view direction (1, 1, 1): one straight in front of the other.
    expect(drawingsOverlap(cube(0, 0, 0), cube(12, 12, 12))).toBe(true);
    // Side by side across the view: their drawings miss.
    expect(drawingsOverlap(cube(0, 0, 0), cube(30, -30, 0))).toBe(false);
  });

  it("orders a pair by a plane between them", () => {
    expect(behind(cube(0, 0, 0), cube(0, 0, 12))).toBe(true);
    expect(behind(cube(0, 0, 12), cube(0, 0, 0))).toBe(false);
    expect(behind(cube(0, 0, 0), cube(5, 5, 5))).toBeNull();
    expect(interpenetrate(cube(0, 0, 0), cube(5, 5, 5))).toBe(true);
    expect(interpenetrate(cube(0, 0, 0), cube(0, 0, 10))).toBe(false);
  });

  it("paints back to front, and keeps the given order where nothing overlaps", () => {
    // Given front first: the one behind must still paint first.
    expect(paintOrder([cube(12, 12, 12), cube(0, 0, 0)])).toEqual([1, 0]);
    expect(paintOrder([cube(0, 0, 0), cube(30, -30, 0)])).toEqual([0, 1]);
    expect(paintOrder([cube(30, -30, 0), cube(0, 0, 0)])).toEqual([0, 1]);
  });
});
