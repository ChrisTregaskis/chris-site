import { describe, expect, it } from "vitest";
import {
  type Falloff,
  distanceToBox,
  meshStrengthAt,
  smoothstep,
} from "./falloff";

const FIGURE = { left: 160, top: 1600, right: 720, bottom: 2000 };
const FALLOFF: Falloff = { margin: 12, width: 260, floor: 0.06 };

describe("distance to a drawing", () => {
  it("is 0 inside, straight-line outside", () => {
    expect(distanceToBox(400, 1800, FIGURE)).toBe(0);
    expect(distanceToBox(820, 1800, FIGURE)).toBe(100);
    expect(distanceToBox(400, 1500, FIGURE)).toBe(100);
    expect(distanceToBox(720 + 30, 2000 + 40, FIGURE)).toBe(50);
  });
});

describe("smoothstep", () => {
  it("runs 0 to 1 between its edges, with no corner", () => {
    expect(smoothstep(0, 10, -5)).toBe(0);
    expect(smoothstep(0, 10, 5)).toBe(0.5);
    expect(smoothstep(0, 10, 15)).toBe(1);
    expect(smoothstep(0, 10, 0.01)).toBeLessThan(0.0001);
    expect(1 - smoothstep(0, 10, 9.99)).toBeLessThan(0.0001);
    expect(smoothstep(5, 5, 4)).toBe(0);
    expect(smoothstep(5, 5, 6)).toBe(1);
  });
});

describe("the mesh's strength round the drawings", () => {
  it("is almost nothing on and next to a drawing", () => {
    expect(meshStrengthAt(400, 1800, [FIGURE], FALLOFF)).toBe(FALLOFF.floor);
    expect(meshStrengthAt(720 + FALLOFF.margin, 1800, [FIGURE], FALLOFF)).toBe(
      FALLOFF.floor,
    );
  });

  it("is full in open paper", () => {
    expect(meshStrengthAt(1300, 1800, [FIGURE], FALLOFF)).toBe(1);
    expect(meshStrengthAt(400, 800, [FIGURE], FALLOFF)).toBe(1);
    expect(meshStrengthAt(400, 800, [], FALLOFF)).toBe(1);
  });

  it("comes back with no step anywhere: no visible boundary", () => {
    let previous = meshStrengthAt(720, 1800, [FIGURE], FALLOFF);
    for (let x = 721; x < 1200; x++) {
      const s = meshStrengthAt(x, 1800, [FIGURE], FALLOFF);
      expect(s).toBeGreaterThanOrEqual(previous);
      // Smoothstep's steepest is 1.5 / width per px.
      expect(s - previous).toBeLessThanOrEqual(
        (1.5 * (1 - FALLOFF.floor)) / FALLOFF.width + 1e-9,
      );
      previous = s;
    }
  });

  it("takes the quieter of two drawings, never adding them up", () => {
    const rings = { left: 160, top: 2400, right: 720, bottom: 2960 };
    const between = meshStrengthAt(440, 2200, [FIGURE, rings], FALLOFF);
    expect(between).toBe(
      Math.min(
        meshStrengthAt(440, 2200, [FIGURE], FALLOFF),
        meshStrengthAt(440, 2200, [rings], FALLOFF),
      ),
    );
    expect(between).toBeGreaterThanOrEqual(FALLOFF.floor);
  });

  it("follows a drawing that moves (pinned, it moves against the page)", () => {
    const pinnedLater = { ...FIGURE, top: 2600, bottom: 3000 };
    expect(meshStrengthAt(400, 1800, [pinnedLater], FALLOFF)).toBe(1);
    expect(meshStrengthAt(400, 2800, [pinnedLater], FALLOFF)).toBe(
      FALLOFF.floor,
    );
  });
});
