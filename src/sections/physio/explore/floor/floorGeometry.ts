import { type Spot } from "../../leakTest";

/*
 * Exploration, draft C ("Glass floor"): the rest of the table falls over
 * backwards. At rest the sheets stand as the one table. Once a request
 * arrives the policy is a glass floor seen from a little above: the sheet
 * that comes back stands on it, turned to face you and glowing, and the
 * rest tip over backwards and lie flat beneath it, side by side, each in
 * its own column with its name on its front edge. Scene px: y down the
 * scene, z towards the viewer; the scene leans its top towards the viewer
 * (the eye is above), about the glass's front edge.
 */
export const FLOOR = {
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
  table: { y: 4, z: 0 },
  /** What comes back stands on the glass, back from its edge, so glass shows in front. */
  stand: { z: -40 },
  /** The glass's front edge strip, facing you: the rule (step 2) or the policy's name (step 3). */
  edge: { inset: 6, h: 17 },
  /**
   * The sheets lying under the glass, side by side: their front edge, how
   * far back they run, the gap between them, and their name strip's height.
   */
  slab: { y: 132, depth: 80, inset: 6, gap: 6, spine: 17 },
  /** An attempt: the sheet asked for lifts its far end up through the glass, and falls back. */
  lift: -34,
  /** The empty result's height, standing where a result would. */
  emptyH: 60,
} as const;

export function floorView(apart: boolean): string {
  return `rotateX(${apart ? FLOOR.apart : FLOOR.rest}deg)`;
}

/**
 * A standing sheet's transform for its spot, turning about its foot (its
 * plate's bottom edge, `height` down): standing at rest, standing on the
 * glass and facing the viewer as the result, tipped over flat (and fading:
 * its slab takes over) when held.
 */
export function floorPlace(spot: Spot, height: number): string {
  if (spot.at === "table") {
    return `translate3d(0, ${FLOOR.table.y}px, 0) rotateX(0deg)`;
  }
  if (spot.at === "result") {
    return `translate3d(0, ${FLOOR.y - height}px, ${FLOOR.stand.z}px) rotateX(${-FLOOR.apart}deg)`;
  }
  return `translate3d(0, ${FLOOR.slab.y - height}px, 0) rotateX(90deg)`;
}

/** Turns a lying thing's front strip back up to face the viewer. */
export const FACING = `rotateX(${-FLOOR.apart}deg)`;
