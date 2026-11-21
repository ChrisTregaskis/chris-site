import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DRAW_MS, UNDRAW_MS, useDrawOn } from "./useDrawOn";

/** Animation frames held until a test runs them, at times it chooses. */
let frames: FrameRequestCallback[] = [];
let clock = 0;

beforeEach(() => {
  frames = [];
  clock = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

// Unmount while the frame stubs are still in place (jsdom has none).
afterEach(() => cleanup());

/** Runs frames 16ms apart for `ms`. */
function play(ms: number) {
  const end = clock + ms;
  while (clock < end && frames.length) {
    clock += 16;
    const now = clock;
    const pending = frames;
    frames = [];
    for (const callback of pending) callback(now);
  }
}

/** Just enough of the drawing: the edge's first line and icon, the admin's icon. */
function Drawing({
  current,
  still = false,
}: {
  current: number;
  still?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useDrawOn(ref, current, still);
  return (
    <svg ref={ref}>
      <path data-testid="line" data-draw="visitor-api" pathLength={1} />
      <g data-testid="visitor" data-draw="visitor" />
      <g data-testid="api" data-draw="api" />
      <g data-testid="admin" data-draw="admin" />
    </svg>
  );
}

const opacity = (id: string) =>
  document.querySelector<SVGElement>(`[data-testid="${id}"]`)?.style.opacity;
const offset = () =>
  document.querySelector<SVGElement>('[data-testid="line"]')?.style
    .strokeDashoffset;

describe("drawing the rings on and off", () => {
  it("draws a step on over its time: the line first, its icon as the line arrives", () => {
    const { rerender } = render(<Drawing current={0} />);
    rerender(<Drawing current={1} />);
    // Early on: the visitor fading in, its line part drawn, the API not yet.
    play(DRAW_MS * 0.06);
    expect(Number(opacity("visitor"))).toBeGreaterThan(0);
    expect(Number(offset())).toBeGreaterThan(0);
    expect(Number(offset())).toBeLessThan(1);
    expect(opacity("api")).toBe("0");
    play(DRAW_MS);
    expect(opacity("api")).toBe("1");
    expect(offset()).toBe("0");
  });

  it("undraws it going back, last drawn first gone", () => {
    const { rerender } = render(<Drawing current={1} />);
    play(DRAW_MS + 100);
    rerender(<Drawing current={0} />);
    // Most of the way back: the API (drawn after the visitor) already gone,
    // the visitor still going.
    play(UNDRAW_MS * 0.9);
    expect(opacity("api")).toBe("0");
    expect(Number(opacity("visitor"))).toBeGreaterThan(0);
    play(UNDRAW_MS);
    expect(opacity("visitor")).toBe("0");
    expect(offset()).toBe("1");
  });

  it("draws every step a fast scroll passes in one step's time, with no backlog", () => {
    const { rerender } = render(<Drawing current={0} />);
    rerender(<Drawing current={6} />);
    play(DRAW_MS + 50);
    expect(opacity("visitor")).toBe("1");
    expect(opacity("admin")).toBe("1");
    expect(frames).toHaveLength(0);
  });

  it("draws everything at once when still", () => {
    render(<Drawing current={0} still />);
    expect(opacity("api")).toBe("1");
    expect(opacity("admin")).toBe("1");
    expect(offset()).toBe("0");
    expect(frames).toHaveLength(0);
  });
});
