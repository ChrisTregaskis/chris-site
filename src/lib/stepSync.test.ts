import { describe, expect, it } from "vitest";
import {
  focusBandMargin,
  focusLine,
  scrollDeltaToFocus,
  stepAtFocus,
} from "./stepSync";

describe("step sync maths", () => {
  it("watches a thin band around the focus line", () => {
    expect(focusBandMargin(450, 900)).toBe("-444px 0px -444px 0px");
    expect(focusBandMargin(500.4, 844)).toBe("-494px 0px -338px 0px");
  });

  it("finds the step spanning the focus line", () => {
    const rects = [
      { top: -300, bottom: 100 },
      { top: 100, bottom: 500 },
      null,
      { top: 500, bottom: 900 },
    ];
    expect(stepAtFocus(rects, 450)).toBe(2);
    expect(stepAtFocus(rects, 500)).toBe(4);
    expect(stepAtFocus(rects, 1000)).toBe(0);
  });

  it("scrolls a card's middle onto the focus line", () => {
    expect(scrollDeltaToFocus({ top: 700, height: 200 }, 450, 900, 20)).toBe(
      350,
    );
    expect(scrollDeltaToFocus({ top: 349, height: 200 }, 450, 900, 20)).toBe(0);
  });

  it("lines a card too tall for the room up with the top limit instead", () => {
    expect(scrollDeltaToFocus({ top: 900, height: 600 }, 600, 844, 380)).toBe(
      520,
    );
  });

  it("puts the focus line mid-screen side by side, and below the pinned figure when stacked", () => {
    expect(focusLine(900, null)).toEqual({ focusY: 450, topLimit: 20 });
    expect(focusLine(844, 384)).toEqual({
      focusY: 384 + 460 * 0.42,
      topLimit: 404,
    });
  });
});
