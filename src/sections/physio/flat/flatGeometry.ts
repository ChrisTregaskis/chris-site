import { type Spot } from "../leakTest";
import { MOST_ROWS, type Org, ORG_ROWS, ORGS } from "../organisations";

/*
 * The flat take on the stack, for phones and narrow two-column screens: no
 * perspective, the same spots, kept short so the pinned panel leaves room
 * for the last step's card on a 640px phone. At rest the sheets lie as one
 * table. Once a request arrives, the policy is a box at the top holding the
 * rest of the table: each held sheet folded down to its tab, side by side
 * in its own column (table order, so a tab never moves while it's held),
 * the policy's rule beneath them; the result opens out below the box. Px,
 * top down.
 */
export const FLAT = {
  /** A sheet's header: all that shows of a held sheet. */
  tab: 20,
  row: 17,
  pad: 6,
  /** The tabs' top inside the policy box, and its padding at the sides. */
  pileTop: 6,
  side: 6,
  /** Between two tabs. */
  tabGap: 6,
  /** The policy's rule, under the tabs inside the box. */
  ruleGap: 4,
  rule: 18,
  boxPad: 5,
  /** Between the policy box and the result. */
  gap: 7,
  /** How far an attempt pushes a tab down, into the box's rule. */
  lunge: 10,
} as const;

/** The one table at rest, every row in it. */
export const FLAT_TABLE_H = FLAT.tab + ORG_ROWS.length * FLAT.row + FLAT.pad;

/** Where the policy's rule sits inside the box. */
export const FLAT_RULE_Y = FLAT.pileTop + FLAT.tab + FLAT.ruleGap;

/** The policy box: the row of tabs, then its rule. */
export const FLAT_BOX_H = FLAT_RULE_Y + FLAT.rule + FLAT.boxPad;

/** Where the result (or the empty one) opens out, below the box. */
export const FLAT_RESULT_Y = FLAT_BOX_H + FLAT.gap;

/** A result's height for its rows. */
export function flatResultHeight(rows: number): number {
  return FLAT.tab + rows * FLAT.row + FLAT.pad;
}

/** The empty result: as tall as the largest one. */
export const FLAT_EMPTY_H = flatResultHeight(MOST_ROWS);

/**
 * The picture's height: room for its tallest state, the same in every
 * state, so the pinned panel never grows over the cards.
 */
export const FLAT_H = Math.max(FLAT_TABLE_H, FLAT_RESULT_Y + FLAT_EMPTY_H);

/** Paint order: held tabs, then the policy's veil, then what comes back. */
export const FLAT_LAYER = { held: 1, policy: 2, result: 3 } as const;

export interface FlatPose {
  y: number;
  height: number;
  /** A held tab's column (table order); null spans the whole width. */
  column: number | null;
  layer: number;
  /** Its rows show (at rest, or as the result); folded to its tab when held. */
  open: boolean;
}

export function flatPose(spot: Spot, org: Org, rows: number): FlatPose {
  if (spot.at === "table") {
    return { y: 0, height: FLAT_TABLE_H, column: null, layer: 1, open: true };
  }
  if (spot.at === "result") {
    return {
      y: FLAT_RESULT_Y,
      height: flatResultHeight(rows),
      column: null,
      layer: FLAT_LAYER.result,
      open: true,
    };
  }
  return {
    y: FLAT.pileTop,
    height: FLAT.tab,
    column: ORGS.indexOf(org),
    layer: FLAT_LAYER.held,
    open: false,
  };
}

/** A pose's left edge and width, as CSS (columns share the box's inner width). */
export function flatSpan(column: number | null): {
  left: string;
  width: string;
} {
  if (column === null) return { left: "0px", width: "100%" };
  const gaps = 2 * FLAT.side + (ORGS.length - 1) * FLAT.tabGap;
  const width = `((100% - ${gaps}px) / ${ORGS.length})`;
  return {
    left: `calc(${FLAT.side}px + ${column} * (${width} + ${FLAT.tabGap}px))`,
    width: `calc(${width})`,
  };
}
