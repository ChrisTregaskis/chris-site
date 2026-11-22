import { type Falloff, meshStrengthAt } from "./falloff";
import { type Box, type MeshSpec, meshPatch } from "./mesh";
import { type Vec3, dentAt, facetNormal, facetShade } from "./shading";

/** Everything that decides how the mesh looks, for one page width. */
export interface MeshLook {
  spec: MeshSpec;
  /** A vertex's height at full relief (±1), in px. */
  relief: number;
  /** Towards the light (see `lightFrom`). */
  light: Vec3;
  /** sRGB levels a facet moves per unit of shade, before any fading. */
  gain: number;
  /**
   * The most a facet may darken the paper, in sRGB levels: the ceiling that
   * keeps text on the mesh at AA (see MAX_SHADOW). Lightening only raises
   * dark text's contrast, so it has none.
   */
  maxShadow: number;
  /** The pointer's dent: its radius and its depth at the centre, in px. */
  dentRadius: number;
  dentDepth: number;
  /** How the mesh steps back around the drawings. */
  falloff: Falloff;
  /** The whole mesh's strength, 0 to 1 (fainter on phones). */
  strength: number;
  /**
   * The net's own lines: a pencil line along every facet edge at this ink
   * alpha (at full strength; each inner edge is drawn by both its facets).
   * 0 draws none, leaving the facets' tone to show the net.
   */
  edge: number;
}

/** The pointer's dent on the page: where, and how far pressed in (0 to 1). */
export interface Dent {
  x: number;
  y: number;
  amount: number;
}

/** One facet to paint: its corners, how many levels lighter (+) or darker (-) than the paper, and the mesh's strength there. */
export interface Facet {
  points: readonly [number, number, number, number, number, number];
  levels: number;
  strength: number;
}

/** Facets moving the paper by less than this are left unpainted. */
const UNSEEN = 0.04;

/**
 * The facets covering `rect`, each with its tone: its relief (and the dent,
 * when there is one) lit from the look's light, scaled down near the
 * drawings in `quiet` and by the look's strength.
 */
export function meshFacets(
  rect: Box,
  look: MeshLook,
  quiet: readonly Box[],
  dent: Dent | null,
): Facet[] {
  const { vertices, triangles } = meshPatch(rect, look.spec);
  const pressed = dent && dent.amount > 0 ? dent : null;
  const z = vertices.map((v) => {
    let height = v.h * look.relief;
    if (pressed) {
      const d = Math.hypot(v.x - pressed.x, v.y - pressed.y);
      height -= look.dentDepth * pressed.amount * dentAt(d, look.dentRadius);
    }
    return height;
  });

  const facets: Facet[] = [];
  for (const [ia, ib, ic] of triangles) {
    const a = vertices[ia];
    const b = vertices[ib];
    const c = vertices[ic];
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const strength =
      look.strength * meshStrengthAt(cx, cy, quiet, look.falloff);
    if (strength <= 0) continue;
    const normal = facetNormal(
      [a.x, a.y, z[ia]],
      [b.x, b.y, z[ib]],
      [c.x, c.y, z[ic]],
    );
    const levels = Math.max(
      -look.maxShadow,
      facetShade(normal, look.light) * look.gain * strength,
    );
    if (Math.abs(levels) < UNSEEN && look.edge * strength <= 0) continue;
    facets.push({
      points: [a.x, a.y, b.x, b.y, c.x, c.y],
      levels,
      strength,
    });
  }
  return facets;
}
