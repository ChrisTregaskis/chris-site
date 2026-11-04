/**
 * Pure camera maths for the 3D figure, kept free of three.js so it can be
 * tested: fitting an orthographic frustum so the 3D board lands exactly where
 * the isometric SVG draws it, and the constrained orbit.
 */

/**
 * The SVG's isometric projection keeps plan lengths (cos 30, sin 30); a true
 * orthographic camera looking down (1, 1, 1) shrinks them by sqrt(2/3). Same
 * picture, different units.
 */
export const ISO_TO_CAMERA = Math.sqrt(2 / 3);

/** The default view: the isometric angle the SVG is drawn from. */
export const ISO_AZIMUTH = Math.PI / 4;
export const ISO_ELEVATION = Math.asin(1 / Math.sqrt(3));

/** How far a visitor may turn the model from the default view. */
export const AZIMUTH_RANGE = [ISO_AZIMUTH - 1.25, ISO_AZIMUTH + 1.25] as const;
export const ELEVATION_RANGE = [0.2, 1.1] as const;

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Frustum {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * The orthographic frustum (camera units, around the pivot) that draws the
 * scene into `canvas` so that it matches the SVG drawn into `svg` with
 * `viewBox` (min x, min y, width, height) under `xMidYMid meet`. `pivot` is
 * the isometric (SVG) point the camera looks at.
 */
export function fitFrustum(
  canvas: Rect,
  svg: Rect,
  viewBox: readonly [number, number, number, number],
  pivot: readonly [number, number],
): Frustum {
  const [minX, minY, vbWidth, vbHeight] = viewBox;
  const scale = Math.min(svg.width / vbWidth, svg.height / vbHeight);
  const originX = svg.left + (svg.width - vbWidth * scale) / 2;
  const originY = svg.top + (svg.height - vbHeight * scale) / 2;
  const isoX = (px: number) => (px - originX) / scale + minX - pivot[0];
  const isoY = (py: number) => (py - originY) / scale + minY - pivot[1];
  return {
    left: isoX(canvas.left) * ISO_TO_CAMERA,
    right: isoX(canvas.left + canvas.width) * ISO_TO_CAMERA,
    // Page y runs down, camera y up.
    top: -isoY(canvas.top) * ISO_TO_CAMERA,
    bottom: -isoY(canvas.top + canvas.height) * ISO_TO_CAMERA,
  };
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Exponential smoothing that behaves the same at any frame rate: how far to
 * move towards a target this frame, for a rate in 1/seconds.
 */
export const smoothing = (rate: number, dtSeconds: number) =>
  1 - Math.exp(-rate * dtSeconds);

/** A cubic-bezier easing, as CSS defines it (the motion tokens' EASE). */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const error = sampleX(t) - x;
      const slope = slopeX(t);
      if (Math.abs(error) < 1e-5 || Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    return sampleY(clamp(t, 0, 1));
  };
}
