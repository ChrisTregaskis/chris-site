import { describe, expect, it } from "vitest";
import { LAYOUTS } from "./sampleLayouts";
import { bandReach, endsReach, reachAt, reachStops } from "./reach";

describe("where the mesh lies, at its ends", () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const reach = endsReach(layout);
    const hero = layout.heroBottom - layout.heroTop;

    it(`${name}: is full behind the hero's headline, and from About's top through Contact to the foot`, () => {
      for (let y = 0; y <= layout.heroTop + 0.55 * hero; y += 8) {
        expect(reachAt(y, reach)).toBe(1);
      }
      for (let y = layout.aboutTop; y <= layout.pageBottom; y += 8) {
        expect(reachAt(y, reach)).toBe(1);
      }
    });

    it(`${name}: is absent through the case studies, from just into Wayfinder to half a hero before About`, () => {
      for (
        let y = layout.workTop + 0.2 * hero;
        y <= layout.aboutTop - 0.5 * hero;
        y += 8
      ) {
        expect(reachAt(y, reach), String(y)).toBe(0);
      }
      // Physio and Burpees carry none at all.
      expect(reachAt(layout.physioTop, reach)).toBe(0);
      expect(reachAt(layout.burpeesTop, reach)).toBe(0);
    });

    it(`${name}: fades with no visible edge, out of the hero and back in at About`, () => {
      // Smoothstep over the fade: never more than its steepest slope per px.
      const outSlope = 1.5 / (reach.outTo - reach.outFrom);
      const inSlope = 1.5 / (reach.inTo - reach.inFrom);
      let previous = reachAt(0, reach);
      for (let y = 1; y <= layout.pageBottom; y++) {
        const value = reachAt(y, reach);
        expect(Math.abs(value - previous)).toBeLessThanOrEqual(
          Math.max(outSlope, inSlope) + 1e-9,
        );
        previous = value;
      }
      // Each fade runs over at least two fifths of a screen: a fade, not a line.
      expect(reach.outTo - reach.outFrom).toBeGreaterThan(
        0.4 * layout.viewHeight,
      );
      expect(reach.inTo - reach.inFrom).toBeGreaterThan(
        0.4 * layout.viewHeight,
      );
    });

    it(`${name}: is little more than a trace where the work's first chapter starts`, () => {
      expect(reachAt(layout.workTop, reach)).toBeLessThan(0.25);
    });

    it(`${name}: is already building as the Burpees chapter ends, half way up by its last quarter of a hero`, () => {
      expect(reachAt(layout.aboutTop - 0.5 * hero, reach)).toBe(0);
      expect(reachAt(layout.aboutTop - 0.25 * hero, reach)).toBeCloseTo(0.5);
      expect(reachAt(layout.aboutTop, reach)).toBe(1);
    });
  }

  it("is everywhere without a reach (the whole page)", () => {
    expect(reachAt(-100, null)).toBe(1);
    expect(reachAt(12000, null)).toBe(1);
  });
});

describe("the reach as gradient stops", () => {
  const reach = endsReach(LAYOUTS.desktop);

  it("runs top to bottom of the band, following the fade", () => {
    const stops = reachStops(400, 1400, reach);
    expect(stops[0]).toEqual({ offset: 0, alpha: reachAt(400, reach) });
    expect(stops[stops.length - 1]).toEqual({
      offset: 1,
      alpha: reachAt(1400, reach),
    });
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].offset).toBeGreaterThan(stops[i - 1].offset);
      expect(stops[i].alpha).toBeLessThanOrEqual(stops[i - 1].alpha);
    }
  });

  it("cuts a run of one value to its ends", () => {
    expect(reachStops(3000, 4000, reach)).toEqual([
      { offset: 0, alpha: 0 },
      { offset: 1, alpha: 0 },
    ]);
  });
});

describe("the most a band shows", () => {
  const reach = endsReach(LAYOUTS.desktop);

  it("is 0 deep in the case studies, so nothing is drawn or measured there", () => {
    expect(bandReach(4000, 5400, reach)).toBe(0);
    expect(bandReach(0, 1400, reach)).toBe(1);
    expect(bandReach(17500, 18900, reach)).toBe(1);
    expect(bandReach(4000, 5400, null)).toBe(1);
  });
});
