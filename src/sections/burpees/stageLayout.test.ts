import { describe, expect, it } from "vitest";
import { STRAIN_OUTSET_EM } from "./countType";
import {
  COUNT_SHARE,
  MIN_CALLS_PX,
  sameLayout,
  stageLayout,
} from "./stageLayout";

/** A 1440px desktop: 1088px of stage, a 72px gap. */
const DESKTOP = { width: 1088, gap: 72, wide: true };
const column = (DESKTOP.width - DESKTOP.gap) * COUNT_SHARE;
const callsLeft = column + DESKTOP.gap;

describe("the stage's layout", () => {
  it("keeps the count at its screen size and the calls beside it, as drawn by most browsers", () => {
    expect(stageLayout({ ...DESKTOP, digit: 180 })).toEqual({
      fit: 1,
      beside: true,
      push: 0,
    });
  });

  it("steps the calls right, clear of two digits drawn wider than their column", () => {
    const digit = 360;
    const { fit, beside, push } = stageLayout({ ...DESKTOP, digit });
    expect(fit).toBe(1);
    expect(beside).toBe(true);
    // The calls start past the right edge of "99", with the gap between.
    expect(callsLeft + push).toBeGreaterThanOrEqual(
      digit * 2 + DESKTOP.gap - 1,
    );
    expect(DESKTOP.width - (callsLeft + push)).toBeGreaterThanOrEqual(
      MIN_CALLS_PX,
    );
  });

  it("moves the calls under the count when stepping aside would leave them too narrow", () => {
    // A 960px screen: 800px of stage, a 38px gap.
    const narrow = { width: 800, gap: 38, wide: true };
    expect(stageLayout({ ...narrow, digit: 200 }).beside).toBe(true);
    expect(stageLayout({ ...narrow, digit: 270 })).toMatchObject({
      beside: false,
      push: 0,
    });
  });

  it("shrinks the count only when a finished set would run off the stage", () => {
    expect(stageLayout({ ...DESKTOP, digit: 362 }).fit).toBe(1);
    const { fit } = stageLayout({ ...DESKTOP, digit: 500 });
    expect(fit).toBeLessThan(1);
    expect(500 * 3 * fit).toBeLessThanOrEqual(DESKTOP.width);
    expect(500 * 3 * fit).toBeGreaterThan(DESKTOP.width - 3);
  });

  it("always puts the calls under the count on phones, and fits 100 to the screen", () => {
    expect(
      stageLayout({ width: 358, gap: 24, digit: 100, wide: false }),
    ).toEqual({ fit: 1, beside: false, push: 0 });
    const { fit, beside } = stageLayout({
      width: 328,
      gap: 24,
      digit: 190,
      wide: false,
    });
    expect(beside).toBe(false);
    expect(190 * 3 * fit).toBeLessThanOrEqual(328);
  });

  it("falls back to the breakpoint's layout before anything can be measured", () => {
    expect(stageLayout({ width: 0, gap: 0, digit: 0, wide: true })).toEqual({
      fit: 1,
      beside: true,
      push: 0,
    });
    expect(
      stageLayout({ width: 0, gap: 0, digit: 0, wide: false }).beside,
    ).toBe(false);
  });

  it("tells when a re-measure changed nothing", () => {
    const a = stageLayout({ ...DESKTOP, digit: 180 });
    expect(sameLayout(a, stageLayout({ ...DESKTOP, digit: 181 }))).toBe(true);
    expect(sameLayout(a, stageLayout({ ...DESKTOP, digit: 470 }))).toBe(false);
  });

  describe("with the strain's strokes (scroll-feel prototype c)", () => {
    /** 1440x900's count: min(24vw, 46svh) = 345.6px, so about 6px a side. */
    const OUTSET = 345.6 * STRAIN_OUTSET_EM;

    it("allows for about 6px a side at a desktop's size", () => {
      expect(OUTSET).toBeGreaterThan(5.5);
      expect(OUTSET).toBeLessThanOrEqual(6.1);
    });

    it("shrinks a straining 100 that would otherwise just fit", () => {
      // 3 x 362 = 1086px fits 1088 unstrained, not with 6px either side.
      expect(stageLayout({ ...DESKTOP, digit: 362 }).fit).toBe(1);
      const { fit } = stageLayout({ ...DESKTOP, digit: 362, outset: OUTSET });
      expect(fit).toBeLessThan(1);
      expect((362 * 3 + 2 * OUTSET) * fit).toBeLessThanOrEqual(DESKTOP.width);
    });

    it("steps the calls clear of two straining digits", () => {
      const digit = 360;
      const { fit, beside, push } = stageLayout({
        ...DESKTOP,
        digit,
        outset: OUTSET,
      });
      expect(beside).toBe(true);
      expect(callsLeft + push).toBeGreaterThanOrEqual(
        (digit * 2 + OUTSET) * fit + DESKTOP.gap,
      );
    });

    it("never lets the count run off the stage or into the calls, at any size the browser draws it", () => {
      const stages = [
        { width: 800, gap: 38, wide: true },
        { width: 1088, gap: 72, wide: true },
        { width: 1400, gap: 72, wide: true },
        { width: 2000, gap: 72, wide: true },
        { width: 343, gap: 24, wide: false },
      ];
      for (const stage of stages) {
        const columnPx = (stage.width - stage.gap) * COUNT_SHARE;
        for (let digit = 60; digit <= 720; digit += 7) {
          for (const outset of [0, 3, OUTSET, 9, 14]) {
            const { fit, beside, push } = stageLayout({
              ...stage,
              digit,
              outset,
            });
            const at = `${stage.width}px, ${digit}px digits, ${outset}px strokes`;
            // 100 and its strokes, both sides, on the stage.
            expect((digit * 3 + 2 * outset) * fit, at).toBeLessThanOrEqual(
              stage.width + 0.01,
            );
            if (!beside) continue;
            // 99's right edge and its stroke, then the gap, then the calls.
            expect(columnPx + stage.gap + push, at).toBeGreaterThanOrEqual(
              (digit * 2 + outset) * fit + stage.gap,
            );
            expect(
              stage.width - (columnPx + stage.gap + push),
              at,
            ).toBeGreaterThanOrEqual(MIN_CALLS_PX);
          }
        }
      }
    });
  });
});
