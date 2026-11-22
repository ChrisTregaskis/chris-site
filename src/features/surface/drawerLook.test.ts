import { describe, expect, it } from "vitest";
import { drawerLookFor, drawerReach } from "./drawerLook";
import { meshFacets } from "./meshFacets";
import { meshLookFor } from "./meshLook";
import { reachAt } from "./reach";
import { DRAWER_LEVELS } from "./strength";

describe("the drawer's mesh", () => {
  it("is the pencil mesh at the drawer's level: Clear well beyond the page's Subtle", () => {
    const look = drawerLookFor(520, DRAWER_LEVELS.clear);
    expect(look.edge).toBeGreaterThan(meshLookFor(520, 260, true).edge * 2);
    expect(drawerLookFor(520, DRAWER_LEVELS.faint).edge).toBeLessThan(
      look.edge,
    );
  });

  it("lies in the empty paper under the form: full just below it, gone well above it", () => {
    // A laptop's drawer: 900px tall, the form ending at 568px.
    const desktop = drawerReach(900, 568);
    expect(reachAt(900, desktop)).toBe(1);
    expect(reachAt(584, desktop)).toBe(1);
    expect(reachAt(400, desktop)).toBeLessThan(0.6);
    expect(reachAt(280, desktop)).toBe(0);
    expect(reachAt(0, desktop)).toBe(0);
  });

  it("on a phone, where the form fills the sheet, is full only below the last of it", () => {
    const phone = drawerReach(696, 660);
    expect(reachAt(696, phone)).toBe(1);
    expect(reachAt(640, phone)).toBeLessThan(1);
    expect(reachAt(300, phone)).toBe(0);
  });

  it("leaves the fields bare: no facet under a field or within 6px of it", () => {
    const look = drawerLookFor(520, DRAWER_LEVELS.bold);
    const field = { left: 40, top: 600, right: 480, bottom: 700 };
    const facets = meshFacets(
      { left: 0, top: 0, right: 520, bottom: 900 },
      look,
      [field],
      null,
    );
    for (const { points, strength } of facets) {
      const x = (points[0] + points[2] + points[4]) / 3;
      const y = (points[1] + points[3] + points[5]) / 3;
      const inside =
        x > field.left - 6 &&
        x < field.right + 6 &&
        y > field.top - 6 &&
        y < field.bottom + 6;
      if (inside) expect(strength).toBe(0);
    }
  });
});
