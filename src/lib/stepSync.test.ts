import { describe, expect, it } from "vitest";
import {
  focusBandMargin,
  focusLine,
  READING_DEPTH,
  readingLine,
  scrollDeltaToFocus,
  stepAtFocus,
} from "./stepSync";

describe("step sync maths", () => {
  it("watches a thin band around the focus line", () => {
    expect(focusBandMargin(450, 900)).toBe("-444px 0px -444px 0px");
    expect(focusBandMargin(500.4, 844)).toBe("-494px 0px -338px 0px");
    // A line outside the viewport (mid-resize) still makes a valid margin.
    expect(focusBandMargin(900, 600)).toBe("-894px 0px -0px 0px");
    expect(focusBandMargin(Number.NaN, 0)).toBe("-0px 0px -0px 0px");
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

  it("never centres a card's top above the top limit (under the sticky bar)", () => {
    // 1440x700 desktop, a 580px card: centred, its top would sit at 60, under the 68px bar.
    expect(scrollDeltaToFocus({ top: 800, height: 580 }, 350, 700, 88)).toBe(
      712,
    );
    // A card with room to spare is still centred.
    expect(scrollDeltaToFocus({ top: 800, height: 400 }, 350, 700, 88)).toBe(
      650,
    );
  });

  it("brings a tall card's bottom into view when asked to align its end", () => {
    // 390x844 phone, figure pinned to 385: the 617px demo card ends in the chat input.
    expect(
      scrollDeltaToFocus({ top: 900, height: 617 }, 500, 844, 405, "end"),
    ).toBe(900 + 617 - (844 - 16));
    // A card that fits is centred as usual.
    expect(
      scrollDeltaToFocus({ top: 900, height: 200 }, 500, 844, 405, "end"),
    ).toBe(scrollDeltaToFocus({ top: 900, height: 200 }, 500, 844, 405));
  });

  it("puts the focus line mid-screen side by side, tracking each step's scroll box", () => {
    expect(focusLine(900, null)).toEqual({
      focusY: 450,
      topLimit: 20,
      track: "step",
    });
    expect(focusLine(900, null, 68)).toEqual({
      focusY: 450,
      topLimit: 88,
      track: "step",
    });
  });

  it("stacked, tracks the cards across the reading line below the pinned figure", () => {
    expect(focusLine(844, 384)).toEqual({
      focusY: 384 + 460 * READING_DEPTH,
      topLimit: 404,
      track: "card",
    });
  });

  it("puts the reading line a quarter of the way into the room under the figure", () => {
    expect(readingLine(385, 844)).toBeCloseTo(499.75);
    // At least 24px into a sliver of room...
    expect(readingLine(500, 568)).toBe(524);
    // ...but never off the bottom of the screen (the figure fills a landscape phone).
    expect(readingLine(600, 568)).toBe(544);
  });

  it("selects a card only once it is meaningfully on screen", () => {
    // Measured stage bottoms and card heights (QA, 1 Nov 2026). The card's top
    // is on the reading line as it is selected, so what shows is the room below it.
    const shown = (stageBottom: number, viewport: number, card: number) =>
      Math.min(card, viewport - readingLine(stageBottom, viewport));
    // 390x844: every Wayfinder card (253 to 294px) and physio card (194px) whole.
    expect(shown(385, 844, 294)).toBe(294);
    expect(shown(456, 844, 194)).toBe(194);
    // 768x1024: whole (was 40px of a 202px card).
    expect(shown(608, 1024, 202)).toBe(202);
    // 375x667: three quarters of a 281px card (was 111px).
    expect(shown(375, 667, 281)).toBeGreaterThanOrEqual(0.75 * 281);
    // 320x568: three quarters of all the room there is (was 128px).
    expect(shown(340, 568, 334)).toBe(0.75 * (568 - 340));
  });
});
