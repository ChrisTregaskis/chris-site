import { type MeshLook } from "./meshFacets";
import { lightFrom } from "./shading";

/** One net for the whole site. */
export const MESH_SEED = 0x5eed;

/**
 * The light: from the upper left, as a drafting table is lit (from the
 * left, so a right hand's shadow never falls across the line being drawn),
 * fairly low, so the facets' tilts read.
 */
export const MESH_LIGHT = lightFrom(225, 38);

/** The pencil net's ink alpha, when it's drawn (each inner edge twice, so about double on the page). */
export const PENCIL = 0.014;

/**
 * The most the mesh darkens the paper, in sRGB levels. The red pen as text
 * is the tightest pair on the deepest chapter paper (Burpees, 4.57:1); a
 * facet 1.5 levels darker still leaves it at 4.5:1 (tones.test pins it).
 * The dent's shadow side is held to this too; its lit side isn't.
 */
export const MAX_SHADOW = 1.5;

/** Below this width (the `sheet` breakpoint) the mesh is a phone's: fainter still. */
export const PHONE_WIDTH = 621;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * The mesh for a page `width` px wide: medium-to-large triangles (about an
 * eighth of the window across, 128 to 196px); a relief of about a tenth of
 * a cell, mostly a slow swell across three or four cells with a little of
 * each vertex's own, so neighbouring facets differ by a level or so; 24
 * sRGB levels per unit of shade, which keeps every facet within about two
 * levels of the paper; a dent 1.6 cells in radius and over a quarter of a cell
 * deep; quiet round the drawings over a band up to 280px wide. `originX`
 * anchors the net to the page's centre line, so it sits the same way round
 * the content at any width.
 */
export function meshLookFor(
  width: number,
  originX: number,
  lines = false,
): MeshLook {
  const cell = clamp(Math.round(width * 0.125), 128, 196);
  const phone = width < PHONE_WIDTH;
  return {
    spec: {
      cell,
      jitter: 0.2,
      originX,
      seed: MESH_SEED,
      roughness: 0.35,
      swell: 3.5,
    },
    relief: cell * 0.11,
    light: MESH_LIGHT,
    gain: 24,
    maxShadow: MAX_SHADOW,
    dentRadius: cell * 1.6,
    dentDepth: cell * 0.28,
    falloff: {
      margin: 12,
      width: clamp(width * 0.18, 140, 280),
      floor: 0.06,
    },
    strength: phone ? 0.6 : 1,
    edge: lines ? PENCIL : 0,
  };
}
