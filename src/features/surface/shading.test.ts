import { describe, expect, it } from "vitest";
import {
  approach,
  dentAt,
  facetNormal,
  facetShade,
  lightFrom,
  shadeFill,
} from "./shading";

const UPPER_LEFT = lightFrom(225, 38);

describe("the light", () => {
  it("is a unit vector, from the upper left (towards -x, -y on the screen) and above the sheet", () => {
    const [x, y, z] = UPPER_LEFT;
    expect(Math.hypot(x, y, z)).toBeCloseTo(1);
    expect(x).toBeLessThan(0);
    expect(y).toBeLessThan(0);
    expect(x).toBeCloseTo(y);
    expect(z).toBeCloseTo(Math.sin((38 * Math.PI) / 180));
  });
});

describe("a facet's shade", () => {
  it("is zero for flat paper, whichever way its corners are listed", () => {
    const n = facetNormal([0, 0, 0], [10, 0, 0], [0, 10, 0]);
    expect(n).toEqual([0, 0, 1]);
    expect(facetNormal([0, 0, 0], [0, 10, 0], [10, 0, 0])).toEqual([0, 0, 1]);
    expect(facetShade(n, UPPER_LEFT)).toBeCloseTo(0);
  });

  it("is lighter tilted towards the light and darker tilted away", () => {
    // Rising to the right and down faces up and left, towards the light.
    const towards = facetNormal([0, 0, 0], [10, 0, 2], [0, 10, 2]);
    const away = facetNormal([0, 0, 0], [10, 0, -2], [0, 10, -2]);
    expect(towards[2]).toBeGreaterThan(0);
    expect(facetShade(towards, UPPER_LEFT)).toBeGreaterThan(0);
    expect(facetShade(away, UPPER_LEFT)).toBeLessThan(0);
  });

  it("is about the same either way for small tilts, so the paper's overall tone holds", () => {
    const towards = facetNormal([0, 0, 0], [10, 0, 0.5], [0, 10, 0.5]);
    const away = facetNormal([0, 0, 0], [10, 0, -0.5], [0, 10, -0.5]);
    const up = facetShade(towards, UPPER_LEFT);
    const down = facetShade(away, UPPER_LEFT);
    expect(Math.abs(up + down)).toBeLessThan(0.1 * Math.abs(up));
  });
});

describe("the dent", () => {
  it("is deepest under the pointer and gone by its rim, with no crease at either", () => {
    expect(dentAt(0, 100)).toBe(1);
    expect(dentAt(100, 100)).toBe(0);
    expect(dentAt(150, 100)).toBe(0);
    expect(dentAt(50, 0)).toBe(0);
    // Flat at the centre and at the rim (the profile's slope is ~0 there).
    expect(1 - dentAt(1, 100)).toBeLessThan(0.001);
    expect(dentAt(99, 100)).toBeLessThan(0.001);
    for (let d = 0; d < 100; d += 5) {
      expect(dentAt(d + 5, 100)).toBeLessThanOrEqual(dentAt(d, 100));
    }
  });
});

describe("a facet's fill", () => {
  it("lifts or lowers the paper by the levels asked for", () => {
    const paper = 240;
    const lighter = shadeFill(3, paper, 30);
    expect(lighter.towards).toBe("light");
    expect(paper + lighter.alpha * (255 - paper)).toBeCloseTo(243);
    const darker = shadeFill(-3, paper, 30);
    expect(darker.towards).toBe("ink");
    expect(paper - darker.alpha * (paper - 30)).toBeCloseTo(237);
  });

  it("never goes past opaque", () => {
    expect(shadeFill(400, 240, 30).alpha).toBe(1);
    expect(shadeFill(-400, 240, 30).alpha).toBe(1);
    expect(shadeFill(5, 255, 30).alpha).toBe(0);
  });
});

describe("easing", () => {
  it("moves part of the way in a frame, all the way in time, and never overshoots", () => {
    const step = approach(0, 1, 16, 100);
    expect(step).toBeGreaterThan(0);
    expect(step).toBeLessThan(1);
    expect(approach(0, 1, 2000, 100)).toBeCloseTo(1);
    expect(approach(0, 1, 16, 0)).toBe(1);
    expect(approach(0.5, 0, -10, 100)).toBe(0.5);
  });
});
