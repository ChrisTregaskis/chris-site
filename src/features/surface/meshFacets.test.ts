import { describe, expect, it } from "vitest";
import { type Facet, meshFacets } from "./meshFacets";
import { meshLookFor } from "./meshLook";

const LOOK = meshLookFor(1440, 720);
const RECT = { left: 0, top: 3000, right: 1440, bottom: 4440 };

const centre = ({ points: p }: Facet) => ({
  x: (p[0] + p[2] + p[4]) / 3,
  y: (p[1] + p[3] + p[5]) / 3,
});
const largest = (facets: Facet[]) =>
  Math.max(...facets.map((f) => Math.abs(f.levels)));

describe("the mesh's facets", () => {
  it("are faint: a few sRGB levels either side of the paper at most", () => {
    const facets = meshFacets(RECT, LOOK, [], null);
    expect(facets.length).toBeGreaterThan(50);
    expect(largest(facets)).toBeGreaterThan(0.5);
    expect(largest(facets)).toBeLessThan(4);
    // Lighter and darker both: the paper's overall tone holds.
    expect(facets.some((f) => f.levels > 0)).toBe(true);
    expect(facets.some((f) => f.levels < 0)).toBe(true);
  });

  it("fade almost to nothing over a drawing and come back in open paper", () => {
    const figure = { left: 160, top: 3400, right: 720, bottom: 3800 };
    const facets = meshFacets(RECT, LOOK, [figure], null);
    const open = meshFacets(RECT, LOOK, [], null);
    const over = facets.filter(({ points }) => {
      const { x, y } = centre({ points, levels: 0, strength: 0 });
      return (
        x > figure.left &&
        x < figure.right &&
        y > figure.top &&
        y < figure.bottom
      );
    });
    expect(over.length).toBeGreaterThan(0);
    expect(largest(over)).toBeLessThanOrEqual(
      largest(open) * LOOK.falloff.floor + 1e-9,
    );
    for (const f of over) expect(f.strength).toBe(LOOK.falloff.floor);
    const far = facets.filter((f) => centre(f).x > 1200);
    expect(far.every((f) => f.strength === 1)).toBe(true);
  });

  it("press in under the pointer: shadow on the side towards the light, light on the far side", () => {
    const dent = { x: 720, y: 3700, amount: 1 };
    const pressed = meshFacets(RECT, LOOK, [], dent);
    const flat = new Map(
      meshFacets(RECT, LOOK, [], null).map((f) => [f.points.join(), f.levels]),
    );
    const change = (f: Facet) => f.levels - (flat.get(f.points.join()) ?? 0);
    const near = pressed.filter((f) => {
      const { x, y } = centre(f);
      return Math.hypot(x - dent.x, y - dent.y) < LOOK.dentRadius * 0.8;
    });
    const upperLeft = near.filter(
      (f) => centre(f).x + centre(f).y < dent.x + dent.y - LOOK.spec.cell / 2,
    );
    const lowerRight = near.filter(
      (f) => centre(f).x + centre(f).y > dent.x + dent.y + LOOK.spec.cell / 2,
    );
    expect(upperLeft.length).toBeGreaterThan(0);
    expect(lowerRight.length).toBeGreaterThan(0);
    const mean = (facets: Facet[]) =>
      facets.reduce((sum, f) => sum + change(f), 0) / facets.length;
    expect(mean(upperLeft)).toBeLessThan(-0.5);
    expect(mean(lowerRight)).toBeGreaterThan(0.5);
    // Far from the pointer, nothing changes.
    const away = pressed.filter(
      (f) =>
        Math.hypot(centre(f).x - dent.x, centre(f).y - dent.y) >
        LOOK.dentRadius + LOOK.spec.cell,
    );
    for (const f of away) expect(change(f)).toBeCloseTo(0);
  });

  it("never darken the paper past the shadow ceiling, even pressed in", () => {
    const pressed = meshFacets(RECT, LOOK, [], { x: 720, y: 3700, amount: 1 });
    for (const f of pressed) {
      expect(f.levels).toBeGreaterThanOrEqual(-LOOK.maxShadow);
    }
    // The lit side isn't held back.
    expect(Math.max(...pressed.map((f) => f.levels))).toBeGreaterThan(
      LOOK.maxShadow,
    );
  });

  it("let go entirely when the dent is released", () => {
    const released = meshFacets(RECT, LOOK, [], { x: 720, y: 3700, amount: 0 });
    expect(released).toEqual(meshFacets(RECT, LOOK, [], null));
  });

  it("are fainter on a phone", () => {
    const phone = meshLookFor(390, 195);
    expect(phone.strength).toBeLessThan(LOOK.strength);
    const rect = { left: 0, top: 3000, right: 390, bottom: 3844 };
    const facets = meshFacets(rect, phone, [], null);
    expect(largest(facets)).toBeLessThan(
      largest(meshFacets(RECT, LOOK, [], null)),
    );
  });
});

describe("the mesh for a width", () => {
  it("is medium-to-large: about an eighth of the window, 128 to 196px", () => {
    expect(meshLookFor(1440, 720).spec.cell).toBe(180);
    expect(meshLookFor(390, 195).spec.cell).toBe(128);
    expect(meshLookFor(2560, 1280).spec.cell).toBe(196);
  });

  it("draws its pencil lines only when asked", () => {
    expect(meshLookFor(1440, 720).edge).toBe(0);
    expect(meshLookFor(1440, 720, true).edge).toBeGreaterThan(0);
  });
});
