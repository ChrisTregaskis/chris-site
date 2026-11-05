import { type Spot } from "../leakTest";
import { ORG_ROWS } from "../organisations";

/*
 * The glass floor: the sessions table in CSS 3D for phones, and for any
 * screen too small for the 3D stack. At rest the sheets stand as the one
 * table. Once a request arrives the policy is a see-through glass floor
 * seen from a little above: the sheet that comes back stands on it, turned
 * to face you and glowing, and the rest of the table tips over backwards
 * and lies flat beneath it, side by side, each in its own column with its
 * name on its front edge. Scene px: y down the scene, z towards the
 * viewer; the scene leans its top towards the viewer (the eye is above),
 * about the glass's front edge.
 */

/** The scene's height, before the zoom. */
export const SCENE_H = 160;

/**
 * Taller screens zoom the whole scene a little (`--pk`), so it gains room
 * and type together. Set on the figure, so the scene and the room kept for
 * it while it loads both read it.
 */
export const ZOOM_CLASSES = "[--pk:1] [@media(min-height:740px)]:[--pk:1.1]";

/** The scene's box, zoomed: the same in every state, so the pinned panel never grows. */
export const SCENE_BOX_H = `calc(${SCENE_H}px * var(--pk, 1))`;

/** A standing sheet's face: its header (the name), a row, the padding under the rows, and its side inset. */
export const FACE = { head: 22, row: 17, pad: 5, side: 12 } as const;

export function faceHeight(rows: number): number {
  return FACE.head + rows * FACE.row + FACE.pad;
}

/** The one table at rest, every row in it. */
export const TABLE_FACE_H = faceHeight(ORG_ROWS.length);

export const GLASS = {
  perspective: 640,
  eyeY: -60,
  /** The glass's front edge, down the scene: the scene turns about it. */
  y: 110,
  /** How far the glass runs back. */
  depth: 92,
  /** The lean at rest, and once apart (the eye looking down on the glass). */
  rest: -10,
  apart: -26,
  /** The standing sheets' inset from the scene's sides. */
  inset: 24,
  table: { y: 4 },
  /** What comes back stands on the glass, back from its edge, so glass shows in front. */
  stand: { z: -40 },
  /** The glass's front edge strip, facing you: the rule (step 2) or the policy's name (step 3). */
  edge: { inset: 6, h: 17 },
  /**
   * The sheets lying under the glass, side by side: their front edge, how
   * far back they run, their inset and the gap between them, and their name
   * strip's height.
   */
  slab: { y: 132, depth: 80, inset: 6, gap: 6, spine: 17 },
  /** An attempt: the sheet asked for lifts its far end up through the glass, and falls back. */
  lift: -34,
  /** The empty result's height, standing where a result would. */
  emptyH: 60,
} as const;

/** The whole scene's lean. */
export function glassView(apart: boolean): string {
  return `rotateX(${apart ? GLASS.apart : GLASS.rest}deg)`;
}

/**
 * A standing sheet's transform for its spot, turning about its foot (its
 * plate's bottom edge, `height` down): standing at rest, standing on the
 * glass and facing the viewer as the result, tipped over flat (and fading:
 * its slab takes over) when held.
 */
export function glassPlace(spot: Spot, height: number): string {
  if (spot.at === "table") {
    return `translate3d(0, ${GLASS.table.y}px, 0) rotateX(0deg)`;
  }
  if (spot.at === "result") {
    return `translate3d(0, ${GLASS.y - height}px, ${GLASS.stand.z}px) rotateX(${-GLASS.apart}deg)`;
  }
  return `translate3d(0, ${GLASS.slab.y - height}px, 0) rotateX(90deg)`;
}

/** Turns a lying thing's front strip, or what stands on the glass, back up to face the viewer. */
export const FACING = `rotateX(${-GLASS.apart}deg)`;

/** A box `inset` px in from both sides of the scene, as CSS. */
export function across(inset: number): { left: string; width: string } {
  return { left: `${inset}px`, width: `calc(100% - ${2 * inset}px)` };
}

/** A held sheet's column (of three) under the glass, as CSS. */
export function slabSpan(column: number): { left: string; width: string } {
  const { inset, gap } = GLASS.slab;
  const width = `((100% - ${2 * inset + 2 * gap}px) / 3)`;
  return {
    left: `calc(${inset}px + ${column} * (${width} + ${gap}px))`,
    width: `calc(${width})`,
  };
}
