import { describe, expect, it } from "vitest";
import {
  clock,
  fittedShape,
  mostReps,
  pacingShape,
  readout,
  viewAt,
  views,
  zoomLevel,
} from "./pacing";

describe("pacingShape", () => {
  it("matches the app's spec for 60 six-counts in 20 minutes", () => {
    const shape = pacingShape("six-count", 60, 20);
    expect(shape).toMatchObject({
      intervalMs: 20_000,
      repMs: 6600,
      countInMs: 5000,
      restMs: 8400,
    });
  });

  it("matches the app's spec for 40 Navy SEALs in 20 minutes", () => {
    expect(pacingShape("navy-seal", 40, 20)).toMatchObject({
      intervalMs: 30_000,
      repMs: 9800,
      countInMs: 5000,
      restMs: 15_200,
    });
  });

  it("gives the app's first-visit session its 0.4s of rest", () => {
    const shape = pacingShape("six-count", 100, 20);
    expect(shape?.restMs).toBe(400);
    expect(shape && clock(shape.totalMs)).toBe("19:54.6");
  });

  it("drops the count-in to whole seconds and collapses the set when dense", () => {
    const dense = pacingShape("six-count", 185, 20);
    expect(dense?.setBeatMs).toBe(800);
    expect(dense?.countInMs).toBe(0);
  });

  it("refuses what doesn't fit, and says what does", () => {
    expect(pacingShape("six-count", 200, 20)).toBeNull();
    const most = mostReps("six-count", 20);
    expect(pacingShape("six-count", most, 20)).not.toBeNull();
    expect(pacingShape("six-count", most + 5, 20)).toBeNull();
  });

  it("writes the readout out", () => {
    const shape = pacingShape("six-count", 60, 20);
    expect(shape && readout(shape)).toBe(
      "One every 20.0s: 6.6s of work, 8.4s of rest and a five-second count-in.",
    );
  });
});

describe("the zoom", () => {
  const shape = fittedShape("six-count", 100, 20);
  const all = views(shape);

  it("holds at each level and travels between", () => {
    expect(zoomLevel(0)).toBe(0);
    expect(zoomLevel(0.5)).toBe(1);
    expect(zoomLevel(1)).toBe(2);
    expect(zoomLevel(0.3)).toBeGreaterThan(0);
    expect(zoomLevel(0.3)).toBeLessThan(1);
  });

  it("lands exactly on each view", () => {
    expect(viewAt(0, all).span).toBeCloseTo(all[0].span);
    expect(viewAt(0, all).start).toBeCloseTo(0);
    expect(viewAt(1, all).span).toBeCloseTo(all[1].span);
    expect(viewAt(1, all).start).toBeCloseTo(all[1].start);
    expect(viewAt(2, all).span).toBeCloseTo(all[2].span);
  });

  it("keeps the focus rep in frame all the way in", () => {
    const focus = all[2];
    for (let level = 0; level <= 2; level += 0.05) {
      const view = viewAt(level, all);
      expect(view.start).toBeLessThanOrEqual(focus.start + 1e-6);
      expect(view.start + view.span).toBeGreaterThanOrEqual(
        focus.start + focus.span - 1e-6,
      );
    }
  });
});
