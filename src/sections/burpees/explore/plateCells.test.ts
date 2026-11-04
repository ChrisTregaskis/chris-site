import { describe, expect, it } from "vitest";
import { holdFor, NAVY_SEAL, SIX_COUNT } from "./plateCells";

describe("the burpee plates", () => {
  it("has twelve positions and ten counts in a Navy SEAL", () => {
    expect(NAVY_SEAL).toHaveLength(12);
    expect(NAVY_SEAL.filter((cell) => cell.count !== null)).toHaveLength(10);
    expect(NAVY_SEAL[0].silent).toBe("set");
    expect(NAVY_SEAL[11].silent).toBe("stand");
  });

  it("has eight positions and six counts in a six-count", () => {
    expect(SIX_COUNT).toHaveLength(8);
    expect(SIX_COUNT.filter((cell) => cell.count !== null)).toHaveLength(6);
  });

  it("uses the same seven drawings for both", () => {
    const poses = new Set([...NAVY_SEAL, ...SIX_COUNT].map((c) => c.pose));
    expect(poses.size).toBe(7);
  });

  it("makes every six-count cell one the Navy SEAL already has", () => {
    const seal = new Set(NAVY_SEAL.map((cell) => cell.key));
    for (const cell of SIX_COUNT) expect(seal.has(cell.key)).toBe(true);
  });

  it("holds the set for a second and the rest of the rep a beat each", () => {
    expect(holdFor(SIX_COUNT, 0)).toBe(1000);
    expect(holdFor(SIX_COUNT, 3)).toBe(800);
    expect(holdFor(SIX_COUNT, 7)).toBeGreaterThan(800);
  });
});
