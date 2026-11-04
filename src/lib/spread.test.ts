import { describe, expect, it } from "vitest";
import { spreadApart } from "./spread";

describe("spreadApart", () => {
  it("leaves labels that already have room where they want to be", () => {
    expect(spreadApart([0, 30, 60], 20)).toEqual([0, 30, 60]);
  });

  it("packs a crowd a gap apart, centred on where it wanted to be", () => {
    // Three wanting 10, 12 and 14 (centred on 12) sit at 2, 12 and 22.
    expect(spreadApart([10, 12, 14], 10)).toEqual([2, 12, 22]);
  });

  it("keeps the input's order and indexes, whatever order they come in", () => {
    const placed = spreadApart([14, 10, 12], 10);
    expect(placed).toEqual([22, 2, 12]);
  });

  it("merges a crowd into a neighbour it pushes into", () => {
    const placed = spreadApart([0, 10, 12, 14], 10);
    const sorted = [...placed].sort((a, b) => a - b);
    sorted.slice(1).forEach((value, k) => {
      expect(value - sorted[k]).toBeGreaterThanOrEqual(10 - 1e-9);
    });
    // Still centred on where they wanted to be, on average.
    const mean = (list: number[]) =>
      list.reduce((sum, v) => sum + v, 0) / list.length;
    expect(mean(placed)).toBeCloseTo(mean([0, 10, 12, 14]) + 0, 5);
  });

  it("handles nothing and one", () => {
    expect(spreadApart([], 10)).toEqual([]);
    expect(spreadApart([7], 10)).toEqual([7]);
  });
});
