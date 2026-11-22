import { describe, expect, it } from "vitest";
import { drawerLookFor, drawerReach } from "./drawerLook";
import { meshFacets } from "./meshFacets";
import { meshLookFor } from "./meshLook";
import { reachAt } from "./reach";

describe("the drawer's mesh", () => {
  it("is the pencil mesh, weaker than the page's", () => {
    const look = drawerLookFor(520);
    expect(look.edge).toBeGreaterThan(0);
    expect(look.strength).toBeLessThan(meshLookFor(520, 260).strength);
  });

  it("gathers at the foot of the drawer: nothing over its top third, full at the bottom", () => {
    const reach = drawerReach(900);
    expect(reachAt(0, reach)).toBe(0);
    expect(reachAt(270, reach)).toBe(0);
    expect(reachAt(600, reach)).toBeGreaterThan(0);
    expect(reachAt(900, reach)).toBe(1);
  });

  it("leaves the fields bare: nothing under a field, nothing within 6px of it", () => {
    const look = drawerLookFor(520);
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
