import { describe, expect, it } from "vitest";
import {
  DRAWER_LEVELS,
  LINE_LEVELS,
  SUBTLE_DARKEST,
  TEXT_BLUR,
  TEXT_PAD,
  UNDER_TEXT,
  cornerCoverage,
  darkestUnderText,
  lineKeepUnderText,
  maskCoverage,
  normalCdf,
} from "./strength";

const LINE = { left: 100, top: 100, right: 700, bottom: 124 };

describe("the levels", () => {
  it("run Subtle (round 4's) < Medium < Strong, and the drawer's Faint < Clear < Bold", () => {
    expect(LINE_LEVELS.subtle).toBe(1);
    expect(LINE_LEVELS.medium).toBeGreaterThan(LINE_LEVELS.subtle);
    expect(LINE_LEVELS.strong).toBeGreaterThan(LINE_LEVELS.medium);
    expect(DRAWER_LEVELS.clear).toBeGreaterThan(DRAWER_LEVELS.faint);
    expect(DRAWER_LEVELS.bold).toBeGreaterThan(DRAWER_LEVELS.clear);
  });
});

describe("the text mask's soft edge", () => {
  it("covers a line of text all but completely, and nothing far from it", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(2)).toBeCloseTo(0.97725, 4);
    expect(maskCoverage(400, 112, LINE)).toBeGreaterThan(0.97);
    expect(maskCoverage(LINE.left, LINE.top, LINE)).toBeGreaterThanOrEqual(
      cornerCoverage() - 0.01,
    );
    expect(maskCoverage(400, LINE.top - TEXT_PAD, LINE)).toBeCloseTo(0.5, 1);
    expect(
      maskCoverage(400, LINE.top - TEXT_PAD - 2 * TEXT_BLUR, LINE),
    ).toBeLessThan(0.01);
  });

  it("has no hard edge: it never changes by more than a Gaussian edge's steepest per px", () => {
    const sigma = TEXT_BLUR / 2;
    const steepest = 1 / (sigma * Math.sqrt(2 * Math.PI));
    let previous = maskCoverage(400, 0, LINE);
    for (let y = 1; y < 220; y++) {
      const value = maskCoverage(400, y, LINE);
      expect(Math.abs(value - previous)).toBeLessThanOrEqual(steepest + 1e-6);
      previous = value;
    }
  });
});

describe("the pencil behind text", () => {
  it("thins more the stronger the level", () => {
    const subtle = lineKeepUnderText(LINE_LEVELS.subtle);
    const medium = lineKeepUnderText(LINE_LEVELS.medium);
    const strong = lineKeepUnderText(LINE_LEVELS.strong);
    expect(subtle).toBeLessThanOrEqual(1);
    expect(medium).toBeLessThan(subtle);
    expect(strong).toBeLessThan(medium);
    expect(strong).toBeGreaterThanOrEqual(0);
  });

  it("leaves text under no more than Subtle at its darkest, at every level", () => {
    for (const level of Object.values(LINE_LEVELS)) {
      expect(darkestUnderText(level, true, LINE)).toBeLessThanOrEqual(
        UNDER_TEXT * SUBTLE_DARKEST + 1e-4,
      );
    }
    for (const level of Object.values(DRAWER_LEVELS)) {
      expect(darkestUnderText(level, true, LINE)).toBeLessThanOrEqual(
        SUBTLE_DARKEST,
      );
    }
  });

  it("without protection, Medium and Strong lay far more under text than AA allows", () => {
    expect(darkestUnderText(LINE_LEVELS.medium, false, LINE)).toBeGreaterThan(
      1.5 * SUBTLE_DARKEST,
    );
    expect(darkestUnderText(LINE_LEVELS.strong, false, LINE)).toBeGreaterThan(
      2 * SUBTLE_DARKEST,
    );
  });
});
