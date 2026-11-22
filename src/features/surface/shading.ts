/**
 * How the paper's facets catch the light. The sheet is a height field: each
 * mesh vertex sits a little above or below it (its relief), and under the
 * pointer the vertices press in (a dent). Each facet's tone is how much more
 * or less it faces the light than flat paper would, so flat paper is
 * exactly the paper colour and the mesh never shifts the page's overall
 * tone, only breaks it into facets.
 *
 * Screen axes: x right, y down, z out of the screen towards the viewer.
 */

export type Vec3 = readonly [number, number, number];

/**
 * The unit vector towards a light that comes from `azimuth` degrees (on the
 * screen, clockwise from the right, so 225 is the upper left) and stands
 * `elevation` degrees above the sheet.
 */
export function lightFrom(azimuth: number, elevation: number): Vec3 {
  const a = (azimuth * Math.PI) / 180;
  const e = (elevation * Math.PI) / 180;
  return [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
}

/** A facet's unit normal, turned to face the viewer. */
export function facetNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n: [number, number, number] = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
  const length = Math.hypot(n[0], n[1], n[2]) || 1;
  // + 0 turns a -0 into 0.
  return [n[0] / length + 0, n[1] / length + 0, n[2] / length + 0];
}

/**
 * How much more (positive) or less (negative) a facet faces the light than
 * the flat sheet does: Lambert's cosine, less the flat sheet's.
 */
export function facetShade(normal: Vec3, light: Vec3): number {
  return (
    normal[0] * light[0] +
    normal[1] * light[1] +
    normal[2] * light[2] -
    light[2]
  );
}

/**
 * How far the sheet presses in at `distance` from the pointer, 1 under it
 * to 0 at `radius` and beyond, smooth at both ends (no crease at the rim).
 */
export function dentAt(distance: number, radius: number): number {
  if (radius <= 0 || distance >= radius) return 0;
  const t = distance / radius;
  const s = 1 - t * t;
  return s * s;
}

/** A facet's paint: lighter towards the sheet colour, darker towards ink. */
export interface FacetFill {
  towards: "light" | "ink";
  alpha: number;
}

/**
 * The fill that moves the paper `levels` sRGB levels (0–255) lighter or
 * darker: white at the alpha that lifts paper by that much, or ink at the
 * alpha that lowers it by that much. `paper` and `ink` are levels too.
 */
export function shadeFill(
  levels: number,
  paper: number,
  ink: number,
  white = 255,
): FacetFill {
  if (levels >= 0) {
    const room = white - paper;
    return {
      towards: "light",
      alpha: room > 0 ? Math.min(1, levels / room) : 0,
    };
  }
  const room = paper - ink;
  return { towards: "ink", alpha: room > 0 ? Math.min(1, -levels / room) : 0 };
}

/** `current` eased towards `target` over `dt` ms with time constant `tau` ms. */
export function approach(
  current: number,
  target: number,
  dt: number,
  tau: number,
): number {
  if (tau <= 0) return target;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, dt) / tau));
}
