import { describe, expect, it } from "vitest";
import { cubicBezier, fitFrustum, ISO_TO_CAMERA } from "./camera";

describe("fitFrustum", () => {
  it("frames the canvas so the pivot lands where the SVG draws it", () => {
    // A 920 × 590 viewBox drawn 1:1 at the canvas origin.
    const rect = { left: 0, top: 0, width: 920, height: 590 };
    const frustum = fitFrustum(rect, rect, [-290, -150, 920, 590], [0, 0]);
    expect(frustum.left).toBeCloseTo(-290 * ISO_TO_CAMERA);
    expect(frustum.right).toBeCloseTo(630 * ISO_TO_CAMERA);
    expect(frustum.top).toBeCloseTo(150 * ISO_TO_CAMERA);
    expect(frustum.bottom).toBeCloseTo(-440 * ISO_TO_CAMERA);
  });

  it("follows the SVG's letterboxing inside a larger canvas", () => {
    const canvas = { left: 0, top: 0, width: 920, height: 1180 };
    // Same width, twice the height: meet centres the drawing vertically.
    const svg = { left: 0, top: 0, width: 920, height: 1180 };
    const frustum = fitFrustum(canvas, svg, [0, 0, 920, 590], [0, 0]);
    expect(frustum.top).toBeCloseTo(295 * ISO_TO_CAMERA);
  });
});

describe("cubicBezier", () => {
  it("matches the ends and is monotonic for the lift ease", () => {
    const ease = cubicBezier(0.3, 0.7, 0.2, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    let previous = 0;
    for (let t = 0.05; t < 1; t += 0.05) {
      expect(ease(t)).toBeGreaterThanOrEqual(previous);
      previous = ease(t);
    }
  });
});
