/**
 * The paper's triangulation: a surveyor's net of near-equilateral triangles,
 * laid on a lattice anchored to the page (so it scrolls with the paper) and
 * nudged off it by a fixed, seeded jitter, so it reads as measured rather
 * than ruled. Pure and unbounded: any patch of the page can be asked for,
 * and the same lattice point always lands in the same place with the same
 * relief, so nothing needs storing for the whole page.
 */

/** A rectangle in page (document) px. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MeshSpec {
  /** A triangle's side before jitter, in px. */
  cell: number;
  /**
   * How far a vertex may stray from its lattice point, along each axis, as
   * a share of `cell`. Under 0.25, no triangle can fold over (a test pins
   * it); the net still reads as hand-measured from about 0.15.
   */
  jitter: number;
  /** The page x a lattice column is anchored to (the page's centre line). */
  originX: number;
  /** Picks the jitter and relief; one seed, one net. */
  seed: number;
  /**
   * How the relief is made, 0 to 1: 0 is a gentle swell across several
   * cells (a sheet that isn't quite flat, so neighbouring facets differ by
   * a little), 1 is each vertex on its own (crumpled). Between, the swell
   * with a little of each vertex's own.
   */
  roughness: number;
  /** The swell's wavelength, in cells. */
  swell: number;
}

export interface MeshVertex {
  x: number;
  y: number;
  /** The vertex's relief, -1 to 1: how far it sits above or below the sheet. */
  h: number;
}

/** Vertices, and the triangles over them as index triples (all wound the same way). */
export interface MeshPatch {
  vertices: MeshVertex[];
  triangles: [number, number, number][];
}

/** The height of one lattice row: an equilateral triangle's. */
export const ROW = Math.sqrt(3) / 2;

/** Whether row j is an odd one (set half a cell over), for negative rows too. */
export function isOddRow(j: number): boolean {
  return Math.abs(j % 2) === 1;
}

/**
 * A stable hash of a lattice point and a channel to [0, 1): integer mixing
 * (murmur3's finaliser), which needs bitwise operators.
 */
/* eslint-disable no-bitwise */
export function hash01(i: number, j: number, k: number, seed: number): number {
  let h =
    (seed ^
      Math.imul(i, 0x27d4eb2d) ^
      Math.imul(j, 0x165667b1) ^
      Math.imul(k + 1, 0x9e3779b1)) >>>
    0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/* eslint-enable no-bitwise */

/**
 * Smooth value noise, -1 to 1: a seeded value at each whole (u, v), eased
 * between them with smoothstep, so it has no creases.
 */
export function swellAt(u: number, v: number, seed: number): number {
  const u0 = Math.floor(u);
  const v0 = Math.floor(v);
  const ease = (t: number) => t * t * (3 - 2 * t);
  const su = ease(u - u0);
  const sv = ease(v - v0);
  const at = (du: number, dv: number) =>
    hash01(u0 + du, v0 + dv, 7, seed) * 2 - 1;
  const top = at(0, 0) + (at(1, 0) - at(0, 0)) * su;
  const bottom = at(0, 1) + (at(1, 1) - at(0, 1)) * su;
  return top + (bottom - top) * sv;
}

/** Lattice point (i, j): column i of row j, odd rows set half a cell over. */
export function vertexAt(i: number, j: number, spec: MeshSpec): MeshVertex {
  const { cell, jitter, originX, seed, roughness, swell } = spec;
  const offset = isOddRow(j) ? 0.5 : 0;
  const spread = (k: number) => (hash01(i, j, k, seed) * 2 - 1) * jitter * cell;
  const own = hash01(i, j, 2, seed) * 2 - 1;
  const wave =
    swell > 0 ? swellAt((i + offset) / swell, (j * ROW) / swell, seed) : own;
  return {
    x: originX + (i + offset) * cell + spread(0),
    y: j * ROW * cell + spread(1),
    h: wave + (own - wave) * roughness,
  };
}

/**
 * Every triangle that may touch `rect` (with a row and column to spare, so
 * jittered edges still cover it), with the vertices they share.
 */
export function meshPatch(rect: Box, spec: MeshSpec): MeshPatch {
  const { cell, originX } = spec;
  const rowHeight = ROW * cell;
  const j0 = Math.floor(rect.top / rowHeight) - 1;
  const j1 = Math.ceil(rect.bottom / rowHeight) + 1;
  const i0 = Math.floor((rect.left - originX) / cell) - 2;
  const i1 = Math.ceil((rect.right - originX) / cell) + 1;
  const columns = i1 - i0 + 1;

  const vertices: MeshVertex[] = [];
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) vertices.push(vertexAt(i, j, spec));
  }
  const at = (i: number, j: number) => (j - j0) * columns + (i - i0);

  const triangles: [number, number, number][] = [];
  for (let j = j0; j < j1; j++) {
    const odd = isOddRow(j);
    for (let i = i0; i < i1; i++) {
      if (odd) {
        // This row sits half a cell right of the next.
        triangles.push([at(i, j), at(i + 1, j), at(i + 1, j + 1)]);
        triangles.push([at(i, j), at(i + 1, j + 1), at(i, j + 1)]);
      } else {
        triangles.push([at(i, j), at(i + 1, j), at(i, j + 1)]);
        triangles.push([at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]);
      }
    }
  }
  return { vertices, triangles };
}

/** Twice a triangle's signed area: positive for every triangle in a patch. */
export function signedArea2(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}
