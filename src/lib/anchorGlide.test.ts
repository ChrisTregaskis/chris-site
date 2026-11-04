import { describe, expect, it } from "vitest";
import { easeOutCubic, glidePlan } from "./anchorGlide";

describe("anchor glide", () => {
  it("glides straight there when the target is within one reach", () => {
    // 900 viewport: a reach of 765px.
    expect(glidePlan(0, 600, 900, 300, 600)).toEqual({
      jump: null,
      start: 0,
      duration: Math.round(300 + 300 * (600 / 765)),
    });
  });

  it("cuts to one reach short of a far target, then glides the last stretch", () => {
    expect(glidePlan(0, 12000, 900, 300, 600)).toEqual({
      jump: 12000 - 765,
      start: 12000 - 765,
      duration: 600,
    });
  });

  it("comes from below when the target is above", () => {
    const plan = glidePlan(12000, 1000, 900, 300, 600);
    expect(plan.jump).toBe(1765);
    expect(plan.duration).toBe(600);
  });

  it("takes the shortest time for no distance", () => {
    expect(glidePlan(500, 500, 900, 300, 600).duration).toBe(300);
  });

  it("eases out and stays within 0 to 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
    expect(easeOutCubic(2)).toBe(1);
  });
});
