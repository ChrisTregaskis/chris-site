import { type Spot } from "../../leakTest";
import { SCENE_H } from "../sceneMeasures";

/*
 * Exploration, draft A ("Tray"): the desktop's 3D stack re-cut for a phone.
 * The same objects and moves, re-proportioned for a short, full-width box:
 * the sheets lie back under the query, the one that comes back sits out in
 * front at the foot, and the rest of the table falls back behind the dashed
 * policy, each slot further back and higher, so only the names show over
 * the one in front. Scene px: y down the scene, z towards the viewer.
 */
export const TRAY = {
  perspective: 600,
  /** The eye: a little above the scene, so what's further back rises. */
  eyeY: -40,
  /** The scene tips back about its middle, so its foot comes forward no wider than the box. */
  axisY: SCENE_H / 2,
  /** Tilt at rest, and once apart. */
  rest: 14,
  apart: 20,
  /** The sheets' inset from the scene's sides: narrower than the policy, which shows round them. */
  inset: 24,
  table: { y: 4, z: 0 },
  result: { y: 70, z: 0 },
  /**
   * The pile behind the policy: its front slot, and each slot further back
   * and a name higher. While the leak test asks, three are held and the
   * empty result is shorter, so the pile sits a slot lower.
   */
  held: { y: 48, z: -18, stepY: -18, stepZ: -10, asking: 18 },
  /** The empty result: lower and shorter than a result, under the third name. */
  empty: { y: 88, h: 60 },
  /** The policy plane: inset, top, height and depth. */
  plane: { inset: 6, y: -2, h: 154, z: -12 },
  /** Its rule, down the plane: under its top edge, above the pile's names. */
  ruleTop: 20,
  /** How far an attempt comes at the policy: down and forward, through it. */
  lunge: { y: 8, z: 22 },
} as const;

export function trayView(apart: boolean): string {
  return `rotateX(${apart ? TRAY.apart : TRAY.rest}deg)`;
}

/** Where a sheet sits for its spot (`asking`: the leak test is asking, three held). */
export function trayPose(
  spot: Spot,
  asking: boolean,
): { y: number; z: number } {
  if (spot.at === "table") return TRAY.table;
  if (spot.at === "result") return TRAY.result;
  return {
    y:
      TRAY.held.y +
      (asking ? TRAY.held.asking : 0) +
      spot.slot * TRAY.held.stepY,
    z: TRAY.held.z + spot.slot * TRAY.held.stepZ,
  };
}
