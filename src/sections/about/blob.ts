/**
 * The About photo's splash-shaped mask: two closed cubic-bezier blobs in a
 * 0 to 1 box (objectBoundingBox units), and the shape between them at t.
 */
const BLOB_A = [
  0.5, 0.02, 0.7, 0.0, 0.9, 0.1, 0.95, 0.3, 1.0, 0.5, 0.97, 0.72, 0.85, 0.86,
  0.73, 0.99, 0.52, 1.0, 0.34, 0.96, 0.15, 0.92, 0.02, 0.78, 0.02, 0.58, 0.01,
  0.38, 0.08, 0.2, 0.22, 0.1, 0.31, 0.04, 0.4, 0.03, 0.5, 0.02,
];
const BLOB_B = [
  0.54, 0.04, 0.75, 0.03, 0.93, 0.16, 0.97, 0.37, 1.0, 0.57, 0.93, 0.75, 0.8,
  0.88, 0.66, 1.0, 0.45, 0.99, 0.29, 0.93, 0.11, 0.86, 0.0, 0.7, 0.03, 0.5,
  0.05, 0.32, 0.13, 0.16, 0.28, 0.08, 0.37, 0.04, 0.45, 0.04, 0.54, 0.04,
];

/** SVG path data for the blob at t (0: shape A, 1: shape B). */
export function blobPath(t: number): string {
  const v = BLOB_A.map((a, i) => (a + (BLOB_B[i] - a) * t).toFixed(4));
  let d = `M${v[0]},${v[1]}`;
  for (let i = 2; i < v.length; i += 6) {
    d += ` C${v[i]},${v[i + 1]} ${v[i + 2]},${v[i + 3]} ${v[i + 4]},${v[i + 5]}`;
  }
  return `${d}Z`;
}

/** Where the blob sits when nothing moves (reduced motion), as in b3. */
export const STILL_T = 0.35;
