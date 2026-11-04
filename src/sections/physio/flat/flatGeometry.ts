import { type Spot } from "../leakTest";
import { MOST_ROWS, ORG_ROWS, ORGS } from "../organisations";

/*
 * The flat take on the stack, for phones and narrow two-column screens: no
 * perspective, the same spots. At rest the sheets lie as one table. Once a
 * request arrives, the policy is a box at the top holding the rest of the
 * table, each held sheet folded down to its tab, front ones lower and wider;
 * the result opens out below the box. Px, top down.
 */
export const FLAT = {
  /** A sheet's header: all that shows of a held sheet. */
  tab: 20,
  row: 20,
  pad: 6,
  /** The back tab's top inside the policy box. */
  pileTop: 6,
  /** Each tab further forward sits this much lower (overlapping the one behind by 2px). */
  tabStep: 18,
  /** Each slot further back is this much narrower on each side. */
  inset: 8,
  /** The policy's rule, under the front tab inside the box. */
  ruleGap: 4,
  rule: 18,
  boxPad: 5,
  /** Between the policy box and the result. */
  gap: 7,
  /** How far an attempt pushes the front tab down at the box's edge. */
  lunge: 12,
} as const;

const SLOTS = ORGS.length;

/** The one table at rest, every row in it. */
export const FLAT_TABLE_H = FLAT.tab + ORG_ROWS.length * FLAT.row + FLAT.pad;

/** Where the front (lowest) tab sits. */
const FRONT_TAB_Y = FLAT.pileTop + (SLOTS - 1) * FLAT.tabStep;

/** Where the policy's rule sits inside the box. */
export const FLAT_RULE_Y = FRONT_TAB_Y + FLAT.tab + FLAT.ruleGap;

/** The policy box: the pile, then its rule. */
export const FLAT_BOX_H = FLAT_RULE_Y + FLAT.rule + FLAT.boxPad;

/** Where the result (or the empty one) opens out, below the box. */
export const FLAT_RESULT_Y = FLAT_BOX_H + FLAT.gap;

/** A result's height for its rows. */
export function flatResultHeight(rows: number): number {
  return FLAT.tab + rows * FLAT.row + FLAT.pad;
}

/** The empty result: as tall as the largest one. */
export const FLAT_EMPTY_H = flatResultHeight(MOST_ROWS);

/** The picture's height: room for its tallest state. */
export const FLAT_H = Math.max(FLAT_TABLE_H, FLAT_RESULT_Y + FLAT_EMPTY_H);

/** Paint order: held tabs (front highest), then the policy's veil, then what comes back. */
export const FLAT_LAYER = { policy: SLOTS + 1, result: SLOTS + 2 } as const;

export interface FlatPose {
  y: number;
  height: number;
  /** In from each side. */
  inset: number;
  layer: number;
  /** Its rows show (at rest, or as the result); folded to its tab when held. */
  open: boolean;
}

export function flatPose(spot: Spot, rows: number): FlatPose {
  if (spot.at === "table") {
    return { y: 0, height: FLAT_TABLE_H, inset: 0, layer: 1, open: true };
  }
  if (spot.at === "result") {
    return {
      y: FLAT_RESULT_Y,
      height: flatResultHeight(rows),
      inset: 0,
      layer: FLAT_LAYER.result,
      open: true,
    };
  }
  return {
    y: FRONT_TAB_Y - spot.slot * FLAT.tabStep,
    height: FLAT.tab,
    inset: FLAT.inset * (spot.slot + 1),
    layer: SLOTS - spot.slot,
    open: false,
  };
}
