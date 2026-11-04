import { type Spot } from "../leakTest";
import { MOST_ROWS, ORG_ROWS } from "../organisations";

/*
 * Where things sit in the 3D stack, in px inside its tilted plane (y down
 * the sheet, z towards the viewer). Tuned by eye with the perspective in
 * `DepthStack`: the pile behind the policy shows only each sheet's header,
 * and the result covers the rest of it.
 */

/** A sheet's width, header, row and bottom padding. */
export const SHEET = { w: 460, header: 42, row: 36, pad: 12 } as const;

/** The one table at rest, every row in it. */
export const TABLE_H = SHEET.header + ORG_ROWS.length * SHEET.row + SHEET.pad;

/** Room for the stack in the page: down to just under the policy plane. */
export const STACK_H = 410;

/** Where the perspective's vanishing point sits, below the stack's top: everything above was tuned to it. */
export const VANISHING_Y = 450;

/** The one table at rest: high in the stack, close under its name. */
export const TABLE = { y: -36, z: 0 } as const;

/** The result: out in front, at the foot of the stack. */
export const RESULT = { y: 205, z: 80 } as const;

/** The pile behind the policy: its front slot, and each slot further back. */
export const HELD = { y: 40, z: -95, stepY: 64, stepZ: 25 } as const;

/** The policy plane: its top edge, height and depth, with room all round. */
export const PLANE = { y: -60, h: 445, z: -40, overhang: 40 } as const;

/** The empty result: as big as the largest result, so it covers the pile the same way. */
export const EMPTY_H = SHEET.header + MOST_ROWS * SHEET.row + SHEET.pad;

/** The whole stack's view: flatter at rest, a little more tilted once apart. */
export const VIEW = {
  rest: "rotateX(20deg)",
  apart: "rotateX(24deg) rotateZ(-2deg)",
} as const;

/** Where a sheet sits for its spot. */
export function depthPose(spot: Spot): { y: number; z: number } {
  if (spot.at === "table") return TABLE;
  if (spot.at === "result") return RESULT;
  return {
    y: HELD.y - spot.slot * HELD.stepY,
    z: HELD.z - spot.slot * HELD.stepZ,
  };
}

/** A sheet's height: the whole table at rest, else its own rows. */
export function sheetHeight(spot: Spot, rows: number): number {
  return spot.at === "table"
    ? TABLE_H
    : SHEET.header + rows * SHEET.row + SHEET.pad;
}

/**
 * Where the 3D stack fits: a figure column at least ~540px wide beside the
 * steps, and the figure's height (about 630px) under the top bar. Narrower
 * or shorter, the figure is drawn flat.
 */
export const DEPTH_QUERY = "(min-width: 1140px) and (min-height: 720px)";
