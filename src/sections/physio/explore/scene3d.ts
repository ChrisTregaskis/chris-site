/*
 * Exploration: just enough of CSS 3D to check a phone drawing on paper,
 * so a test can say that nothing leaves the scene's box in any state. The
 * axes are CSS's: x right, y down, z towards the viewer; angles in degrees,
 * and positive rotateX tips an element's top away, as in CSS.
 */
export interface Point {
  x: number;
  y: number;
  z: number;
}

const RAD = Math.PI / 180;

/** `rotateX(deg)` about a transform origin at height `oy` (and depth 0). */
export function rotateX(p: Point, deg: number, oy: number): Point {
  const cos = Math.cos(deg * RAD);
  const sin = Math.sin(deg * RAD);
  const y = p.y - oy;
  return { x: p.x, y: oy + y * cos - p.z * sin, z: y * sin + p.z * cos };
}

/** `rotateZ(deg)` about a transform origin at (`ox`, `oy`). */
export function rotateZ(p: Point, deg: number, ox: number, oy: number): Point {
  const cos = Math.cos(deg * RAD);
  const sin = Math.sin(deg * RAD);
  const x = p.x - ox;
  const y = p.y - oy;
  return { x: ox + x * cos - y * sin, y: oy + x * sin + y * cos, z: p.z };
}

/** Where a point lands on screen through a perspective of `distance` from (`ox`, `oy`). */
export function project(
  p: Point,
  distance: number,
  ox: number,
  oy: number,
): { x: number; y: number } {
  const k = distance / (distance - p.z);
  return { x: ox + (p.x - ox) * k, y: oy + (p.y - oy) * k };
}

/** The four corners of a rectangle lying in a plane at depth `z`. */
export function corners(
  left: number,
  top: number,
  width: number,
  height: number,
  z: number,
): Point[] {
  return [
    { x: left, y: top, z },
    { x: left + width, y: top, z },
    { x: left, y: top + height, z },
    { x: left + width, y: top + height, z },
  ];
}

export interface SceneView {
  /** The scene's width (its height is `SCENE_H`). */
  width: number;
  perspective: number;
  /** The eye's height (across, it's the middle). */
  eyeY: number;
  /** The scene's tilt, and the height it turns about. */
  tilt: number;
  axisY: number;
}

/** Where a point in the scene lands on screen, through the scene's tilt and perspective. */
export function throughScene(
  p: Point,
  view: SceneView,
): { x: number; y: number } {
  const tilted = rotateX(p, view.tilt, view.axisY);
  return project(tilted, view.perspective, view.width / 2, view.eyeY);
}
