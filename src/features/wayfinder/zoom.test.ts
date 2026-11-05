import { describe, expect, it } from "vitest";
import {
  APART_EXTENT,
  EDGE_PX,
  figureEdge,
  fitScale,
  MAX_ZOOM,
  zoomFor,
} from "./zoom";

/** The figure's column at 1440×900: about 560px wide, pinned mid-stage. */
const AT_1440 = {
  left: 176,
  right: 734,
  top: 270,
  bottom: 628,
  ceiling: 80,
  edge: 24,
};

describe("the figure's growth while taken apart", () => {
  it("draws the whole viewBox into the box it is given", () => {
    expect(fitScale(920, 590)).toBe(1);
    expect(fitScale(460, 590)).toBe(0.5);
  });

  it("reaches above the board's own box taken apart (so it needs the room)", () => {
    expect(APART_EXTENT.top).toBeLessThan(-150);
  });

  it("grows into the page's empty left margin", () => {
    const zoom = zoomFor(AT_1440);
    expect(zoom).toBeGreaterThan(1.2);
    expect(zoom).toBeLessThanOrEqual(MAX_ZOOM);
    // From its bottom-right corner, its left edge stays on screen.
    const width = AT_1440.right - AT_1440.left;
    expect(AT_1440.right - width * zoom).toBeGreaterThan(0);
  });

  it("stops at the top bar", () => {
    const low = zoomFor(AT_1440);
    const high = zoomFor({ ...AT_1440, top: 150, bottom: 508 });
    expect(high).toBeLessThan(low);
  });

  it("never grows past the most it may, nor shrinks", () => {
    const roomy = { ...AT_1440, left: 600, right: 1158, top: 500, bottom: 858 };
    expect(zoomFor(roomy)).toBe(MAX_ZOOM);
    const cramped = { ...AT_1440, left: 0, right: 558 };
    expect(zoomFor(cramped)).toBe(1);
    expect(zoomFor({ ...AT_1440, right: AT_1440.left })).toBe(1);
  });
});

describe("the edge the grown figure keeps", () => {
  it("is the page's --figure-edge where it sets one", () => {
    expect(figureEdge("64px")).toBe(64);
    expect(figureEdge(" 64px")).toBe(64);
  });

  it("is 24px otherwise", () => {
    expect(EDGE_PX).toBe(24);
    expect(figureEdge("")).toBe(EDGE_PX);
    expect(figureEdge("auto")).toBe(EDGE_PX);
    expect(figureEdge("0px")).toBe(EDGE_PX);
  });

  it("holds the figure further in, so it grows less where the margin is tight", () => {
    const kept = zoomFor({ ...AT_1440, edge: 64 });
    expect(kept).toBeLessThan(zoomFor(AT_1440));
    expect(kept).toBeGreaterThan(1.2);
  });
});
