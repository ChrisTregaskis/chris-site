import { describe, expect, it } from "vitest";
import { STACK_H } from "../depth/depthGeometry";
import { DEPTH_INK, fitDepth, MAX_BOOST, MIN_SCALE } from "./fitDepth";

/**
 * The pinned column's width for a viewport width, as the page lays it out:
 * a 1200px container less its gutters, the gap, then the figure's 1.1fr of
 * two columns side by side; the content width stacked.
 */
function room(viewport: number, stacked: boolean): number {
  const gutter = Math.min(56, Math.max(16, viewport * 0.04));
  const content = Math.min(viewport, 1200) - 2 * gutter;
  if (stacked) return content;
  const gap = Math.min(72, Math.max(24, viewport * 0.05));
  return ((content - gap) * 1.1) / 2;
}

const side = (w: number, h: number) =>
  fitDepth({ width: room(w, false), height: h, stacked: false });
const stacked = (w: number, h: number) =>
  fitDepth({ width: room(w, true), height: h, stacked: true });

describe("fitting the 3D stack", () => {
  it("draws it full size where it always was", () => {
    expect(side(1440, 900)).toMatchObject({
      depth: true,
      scale: 1,
      boost: 1,
      query: "large",
      inset: 0,
    });
  });

  it("shrinks it for a smaller laptop, its query a size down and its type grown to match", () => {
    // A 1366 x 768 laptop: about 657px of page under the browser's bars.
    const fit = side(1366, 657);
    expect(fit.depth).toBe(true);
    expect(fit.query).toBe("medium");
    expect(fit.scale).toBeGreaterThan(MIN_SCALE);
    expect(fit.scale).toBeLessThan(0.85);
    expect(fit.scale * fit.boost).toBeCloseTo(1, 2);
  });

  it("keeps the text the size it is on desktop, down to the smallest scale", () => {
    for (let percent = 100; percent >= MIN_SCALE * 100 + 1; percent -= 1) {
      const height = 312 + (STACK_H * percent) / 100;
      const fit = side(1440, height);
      expect(fit.depth).toBe(true);
      expect(fit.scale * fit.boost).toBeGreaterThanOrEqual(
        MIN_SCALE * MAX_BOOST,
      );
    }
  });

  it("reaches tablets in landscape and windows down to about 910 x 649", () => {
    expect(side(1024, 700).depth).toBe(true);
    expect(side(910, 700).depth).toBe(true);
    expect(side(900, 700).depth).toBe(false);
    expect(side(1280, 649).depth).toBe(true);
    expect(side(1280, 640).depth).toBe(false);
  });

  it("stacks it above the steps on tablets held upright, inset so the plane stays on screen", () => {
    const tablet = stacked(768, 1024);
    expect(tablet).toMatchObject({ depth: true, scale: 1, query: "large" });
    expect(tablet.inset).toBe(DEPTH_INK.left);
    const narrow = stacked(540, 880);
    expect(narrow.depth).toBe(true);
    expect(narrow.scale).toBeLessThan(1);
    expect(narrow.inset).toBe(Math.round(DEPTH_INK.left * narrow.scale));
    // The stack and its overhang fit the content width.
    expect(
      (DEPTH_INK.left + DEPTH_INK.right) * narrow.scale,
    ).toBeLessThanOrEqual(room(540, true));
  });

  it("leaves phones to their own drawing", () => {
    for (const [w, h] of [
      [360, 640],
      [390, 844],
      [430, 932],
      [512, 900],
      [768, 860],
    ]) {
      expect(stacked(w, h).depth).toBe(false);
    }
  });
});
