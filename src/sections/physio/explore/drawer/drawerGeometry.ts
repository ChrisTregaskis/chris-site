import { type Spot } from "../../leakTest";

/*
 * Exploration, draft B ("Drawer"): the sheets as index cards standing
 * upright, seen from a little above. At rest they stand together as the
 * one table. Once a request arrives the deck fans out and drops: the rest
 * of the table sinks into a drawer whose see-through dashed front is the
 * policy, so only each card's tab shows above its lid (each organisation's
 * tab in its own column, so no name ever covers another), and the card
 * that comes back stands out in front, glowing. Scene px: y down the
 * scene, z towards the viewer; the scene leans back about its top.
 */
export const DRAWER = {
  perspective: 620,
  /** The eye: above the scene, looking down into the drawer. */
  eyeY: -60,
  axisY: 0,
  /** Lean at rest, and once apart: tops towards the viewer. */
  rest: -8,
  apart: -16,
  /** The cards' inset from the scene's sides. */
  inset: 12,
  table: { y: 14, z: 0 },
  result: { y: 100, z: 0 },
  /**
   * The cards in the drawer: the front slot, and each slot further back.
   * Further back looks higher from above, so each sits a little lower to
   * keep every tab's foot on the lid.
   */
  held: { y: 34, z: -26, stepY: 5, stepZ: -10, depth: 136 },
  /** The drawer's front, the policy: its inset, lid, height and depth; it rises into place as the request arrives. */
  front: { inset: 6, y: 50, h: 146, z: -14, rise: 26 },
  /** Down the front: the rule under the lid, the policy's name under that. */
  ruleTop: 6,
  legendTop: 25,
  /** The empty result: under where a card's tab would be. */
  empty: { y: 118, h: 60 },
  /** An attempt: the card asked for jumps up out of the drawer and hits the lid. */
  jump: { y: -26, z: 6 },
  /** The fan as the deck splits: each card's turn, by its column. */
  fan: [0, -7, 7],
} as const;

export function drawerView(apart: boolean): string {
  return `rotateX(${apart ? DRAWER.apart : DRAWER.rest}deg)`;
}

/** Where a card stands for its spot. */
export function drawerPose(spot: Spot): { y: number; z: number } {
  if (spot.at === "table") return DRAWER.table;
  if (spot.at === "result") return DRAWER.result;
  return {
    y: DRAWER.held.y + spot.slot * DRAWER.held.stepY,
    z: DRAWER.held.z + spot.slot * DRAWER.held.stepZ,
  };
}
