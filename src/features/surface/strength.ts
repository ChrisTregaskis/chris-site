import { type Box } from "./mesh";
import { MAX_SHADOW, PENCIL } from "./meshLook";
import { shadeFill } from "./shading";

/**
 * How strongly the pencil mesh is drawn in open paper, and how it steps
 * back behind text.
 *
 * A level multiplies everything the mesh draws (its lines, its facets'
 * shading and their shadow ceiling): Subtle is round 4's, the most that can
 * lie under text and keep it at AA. Above Subtle, text is protected: within
 * each line of text (and a pad round it) the pencil thins, through a soft
 * edge, until the lines and the facets under the words together darken the
 * paper no more than Subtle did. So the lines fade as they pass behind
 * words and stay strong in the gaps between lines, the ragged ends and the
 * open paper. The facets are left whole: their shading is broad and soft,
 * and thinned it left soft patches round the words.
 */
export const LINE_LEVELS = { subtle: 1, medium: 1.75, strong: 2.5 } as const;
export type LineLevel = keyof typeof LINE_LEVELS;

/**
 * The drawers' mesh, at its foot (empty paper under the form): from the
 * round-4 faint (three quarters of Subtle) to clearly drawn.
 */
export const DRAWER_LEVELS = { faint: 0.75, clear: 2.5, bold: 3.5 } as const;
export type DrawerLevel = keyof typeof DRAWER_LEVELS;

/**
 * Under text, the mesh darkens the paper by at most this share of what
 * Subtle does at its darkest (a line over the darkest facet): a margin
 * under it, so text under the mesh reads a touch better than AA's floor.
 */
export const UNDER_TEXT = 0.85;

/** The paper and ink levels the fills are worked out against (see meshColours: between the plain paper and Burpees's). */
export const PAPER_LEVEL = 238.3;
export const INK_LEVEL = (26 + 32 + 35) / 3;

/** The alpha of the darkest facet at `level`. */
export function shadowAlpha(level: number): number {
  return shadeFill(-MAX_SHADOW * level, PAPER_LEVEL, INK_LEVEL).alpha;
}

/** At its darkest, what Subtle lays on the paper: a line over the darkest facet. */
export const SUBTLE_DARKEST = shadowAlpha(1) + PENCIL;

/** The pad round each line of text, and the blur that softens it (a Gaussian, sigma = TEXT_BLUR / 2), in px. */
export const TEXT_PAD = 12;
export const TEXT_BLUR = 12;

/**
 * What's kept of the pencil fully behind text at `level` (1: all of it):
 * as much as fits, with the darkest facet at that level under it, in
 * UNDER_TEXT of Subtle's darkest, allowing for what the mask's soft edge
 * lets through at a line's corners (`coverage`).
 */
export function lineKeepUnderText(
  level: number,
  coverage = cornerCoverage(),
): number {
  const room =
    (UNDER_TEXT * SUBTLE_DARKEST - shadowAlpha(level)) / (PENCIL * level);
  const keep = 1 - (1 - Math.min(1, room)) / coverage;
  return Math.min(1, Math.max(0, keep));
}

/** The standard normal cumulative distribution (Abramowitz and Stegun 7.1.26). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const poly =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

/**
 * How much of the text mask covers point (x, y): the pad-grown box blurred
 * by a Gaussian of `sigma` (separable, so a product of two edges each way).
 */
export function maskCoverage(
  x: number,
  y: number,
  box: Box,
  pad = TEXT_PAD,
  sigma = TEXT_BLUR / 2,
): number {
  const across =
    normalCdf((x - (box.left - pad)) / sigma) -
    normalCdf((x - (box.right + pad)) / sigma);
  const down =
    normalCdf((y - (box.top - pad)) / sigma) -
    normalCdf((y - (box.bottom + pad)) / sigma);
  return across * down;
}

/** The least the mask covers a line of text: at its corners, for a line far bigger than the blur. */
export function cornerCoverage(): number {
  const box = { left: 0, top: 0, right: 1000, bottom: 1000 };
  return maskCoverage(box.left, box.top, box);
}

/**
 * At its darkest, what the mesh lays on the paper under a line of text at
 * `level` (alpha of ink): the darkest facet, and over it the pencil as the
 * mask leaves it at the line's corners (all of it, unprotected).
 */
export function darkestUnderText(
  level: number,
  protect: boolean,
  box: Box = { left: 0, top: 0, right: 1000, bottom: 1000 },
): number {
  const facet = shadowAlpha(level);
  const line = PENCIL * level;
  const kept = protect
    ? 1 - (1 - lineKeepUnderText(level)) * maskCoverage(box.left, box.top, box)
    : 1;
  // A line over a facet: source-over of two inks.
  return facet + line * kept * (1 - facet);
}
