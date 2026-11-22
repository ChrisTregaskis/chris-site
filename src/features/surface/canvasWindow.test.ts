import { describe, expect, it } from "vitest";
import {
  MAX_CANVAS_PIXELS,
  MAX_PIXEL_RATIO,
  OVERSCAN,
  canvasPixelRatio,
  canvasWindow,
} from "./canvasWindow";

const VIEW = 900;
const PAGE = 19000;

describe("the canvas's band of the page", () => {
  it("always covers the screen, with at least three quarters of the overscan to spare", () => {
    const spare = VIEW * OVERSCAN * 0.75 - 1;
    for (let scrollY = 0; scrollY <= PAGE - VIEW; scrollY += 7) {
      const { top, height } = canvasWindow(scrollY, VIEW, PAGE);
      expect(top).toBeLessThanOrEqual(scrollY);
      expect(top + height).toBeGreaterThanOrEqual(scrollY + VIEW);
      if (top > 0) expect(scrollY - top).toBeGreaterThanOrEqual(spare);
      if (top + height < PAGE) {
        expect(top + height - (scrollY + VIEW)).toBeGreaterThanOrEqual(spare);
      }
    }
  });

  it("moves on in steps, not every pixel", () => {
    const tops = new Set<number>();
    for (let scrollY = 3000; scrollY < 3900; scrollY++) {
      tops.add(canvasWindow(scrollY, VIEW, PAGE).top);
    }
    expect(tops.size).toBeLessThan(10);
  });

  it("never runs past either end of the page", () => {
    expect(canvasWindow(0, VIEW, PAGE).top).toBe(0);
    const end = canvasWindow(PAGE - VIEW, VIEW, PAGE);
    expect(end.top + end.height).toBeLessThanOrEqual(PAGE);
    expect(canvasWindow(0, VIEW, 600)).toEqual({ top: 0, height: 600 });
  });
});

describe("the canvas's pixel ratio", () => {
  it("follows the device's, up to a cap", () => {
    expect(canvasPixelRatio(1, 1440, 1440)).toBe(1);
    expect(canvasPixelRatio(3, 390, 1350)).toBe(MAX_PIXEL_RATIO);
    expect(canvasPixelRatio(0, 390, 1350)).toBe(1);
  });

  it("drops for a huge canvas, so it stays under the pixel budget", () => {
    const ratio = canvasPixelRatio(2, 2560, 2304);
    expect(ratio).toBeLessThan(MAX_PIXEL_RATIO);
    expect(2560 * ratio * 2304 * ratio).toBeLessThanOrEqual(
      MAX_CANVAS_PIXELS + 1,
    );
  });
});
