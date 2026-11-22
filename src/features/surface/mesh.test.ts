import { describe, expect, it } from "vitest";
import {
  type MeshSpec,
  ROW,
  hash01,
  isOddRow,
  meshPatch,
  signedArea2,
  swellAt,
  vertexAt,
} from "./mesh";

const SPEC: MeshSpec = {
  cell: 180,
  jitter: 0.2,
  originX: 720,
  seed: 0x5eed,
  roughness: 0.35,
  swell: 3.5,
};

describe("the paper's triangulation", () => {
  it("puts every lattice point in the same place every time", () => {
    expect(vertexAt(3, -7, SPEC)).toEqual(vertexAt(3, -7, SPEC));
    expect(hash01(1, 2, 3, 4)).toBe(hash01(1, 2, 3, 4));
    expect(vertexAt(3, 7, SPEC)).not.toEqual(
      vertexAt(3, 7, { ...SPEC, seed: 1 }),
    );
  });

  it("keeps each vertex within its jitter of the lattice, and its relief within ±1", () => {
    for (let j = -20; j <= 20; j++) {
      for (let i = -20; i <= 20; i++) {
        const v = vertexAt(i, j, SPEC);
        const x = SPEC.originX + (i + (isOddRow(j) ? 0.5 : 0)) * SPEC.cell;
        const y = j * ROW * SPEC.cell;
        expect(Math.abs(v.x - x)).toBeLessThanOrEqual(SPEC.jitter * SPEC.cell);
        expect(Math.abs(v.y - y)).toBeLessThanOrEqual(SPEC.jitter * SPEC.cell);
        expect(Math.abs(v.h)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("never folds a triangle over, even at the most jitter allowed", () => {
    const patch = meshPatch(
      { left: -2000, top: -2000, right: 4000, bottom: 12000 },
      { ...SPEC, jitter: 0.249 },
    );
    expect(patch.triangles.length).toBeGreaterThan(1000);
    for (const [a, b, c] of patch.triangles) {
      expect(
        signedArea2(patch.vertices[a], patch.vertices[b], patch.vertices[c]),
      ).toBeGreaterThan(0);
    }
  });

  it("covers the patch asked for, with no gaps (its triangles' area adds up)", () => {
    const rect = { left: 0, top: 3000, right: 1440, bottom: 4200 };
    const patch = meshPatch(rect, SPEC);
    // Sample points across the rect: each lies in exactly one triangle.
    const inside = (
      p: { x: number; y: number },
      [a, b, c]: [number, number, number],
    ) => {
      const [va, vb, vc] = [
        patch.vertices[a],
        patch.vertices[b],
        patch.vertices[c],
      ];
      return (
        signedArea2(va, vb, p) >= 0 &&
        signedArea2(vb, vc, p) >= 0 &&
        signedArea2(vc, va, p) >= 0
      );
    };
    for (let y = rect.top + 7; y < rect.bottom; y += 97) {
      for (let x = rect.left + 5; x < rect.right; x += 89) {
        const hits = patch.triangles.filter((t) => inside({ x, y }, t));
        expect(hits.length, `${x},${y}`).toBe(1);
      }
    }
  });

  it("swells smoothly: neighbouring points differ by little, and it stays within ±1", () => {
    let largest = 0;
    for (let u = -5; u < 5; u += 0.05) {
      const a = swellAt(u, 1.3, 9);
      const b = swellAt(u + 0.05, 1.3, 9);
      expect(Math.abs(a)).toBeLessThanOrEqual(1);
      largest = Math.max(largest, Math.abs(a - b));
    }
    // Smoothstep's steepest slope is 1.5x the corner difference (at most 2).
    expect(largest).toBeLessThanOrEqual(0.05 * 2 * 1.5 + 1e-9);
  });

  it("with no roughness takes the swell's relief; with full roughness each vertex's own", () => {
    const smooth = vertexAt(4, 6, { ...SPEC, roughness: 0 });
    const rough = vertexAt(4, 6, { ...SPEC, roughness: 1 });
    expect(smooth.h).toBeCloseTo(swellAt(4 / 3.5, (6 * ROW) / 3.5, SPEC.seed));
    expect(rough.h).toBeCloseTo(hash01(4, 6, 2, SPEC.seed) * 2 - 1);
  });
});
