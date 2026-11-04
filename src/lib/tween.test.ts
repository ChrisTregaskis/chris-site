import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cubicBezier, linear, tween } from "./tween";

describe("cubicBezier", () => {
  it("runs from 0 to 1", () => {
    const ease = cubicBezier(0.3, 0.7, 0.2, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });

  it("is the straight line for (0, 0, 1, 1)", () => {
    const ease = cubicBezier(0, 0, 1, 1);
    for (const t of [0.1, 0.25, 0.5, 0.9]) expect(ease(t)).toBeCloseTo(t, 5);
  });

  it("matches CSS's ease-out at its midpoint, and never runs backwards", () => {
    // cubic-bezier(0, 0, 0.58, 1) at x = 0.5 is about 0.6846.
    const easeOut = cubicBezier(0, 0, 0.58, 1);
    expect(easeOut(0.5)).toBeCloseTo(0.6846, 3);
    let last = 0;
    for (let i = 1; i <= 100; i++) {
      const value = easeOut(i / 100);
      expect(value).toBeGreaterThanOrEqual(last);
      last = value;
    }
  });
});

describe("tween", () => {
  let now = 0;
  let queued: FrameRequestCallback[] = [];
  const frame = (ms: number) => {
    now += ms;
    const run = queued;
    queued = [];
    run.forEach((callback) => callback(now));
  };

  beforeEach(() => {
    now = 0;
    queued = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      queued.push(callback);
      return queued.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {
      queued = [];
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports each frame's value and finishes on the target", () => {
    const values: number[] = [];
    const onDone = vi.fn();
    tween({
      from: 0,
      to: 10,
      duration: 100,
      ease: linear,
      onUpdate: (value) => values.push(value),
      onDone,
    });
    frame(0); // the first frame starts the clock
    frame(50);
    frame(60);
    expect(values).toEqual([0, 5, 10]);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("jumps straight to the target with no duration (reduced motion)", () => {
    const onUpdate = vi.fn();
    tween({ from: 0, to: 1, duration: 0, onUpdate });
    expect(onUpdate).toHaveBeenCalledWith(1);
  });

  it("stops where it is", () => {
    const values: number[] = [];
    const onDone = vi.fn();
    const stop = tween({
      from: 0,
      to: 1,
      duration: 100,
      onUpdate: (value) => values.push(value),
      onDone,
    });
    frame(0);
    stop();
    frame(200);
    expect(values).toEqual([0]);
    expect(onDone).not.toHaveBeenCalled();
  });
});
