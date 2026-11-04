import { describe, expect, it } from "vitest";
import { blockBounds, EXPLODED, subOffset } from "./exploded";
import { PART_ORDER } from "./parts";

describe("the exploded anatomy", () => {
  it("covers every part, numbering its pieces n.1, n.2…", () => {
    expect(EXPLODED.map((part) => part.id).sort()).toEqual(
      [...PART_ORDER].sort(),
    );
    for (const part of EXPLODED) {
      const n = PART_ORDER.indexOf(part.id) + 1;
      expect(part.subs.map((sub) => sub.id).sort()).toEqual(
        part.subs.map((_, i) => `${n}.${i + 1}`),
      );
    }
  });

  it("stacks the BFF's layers back into today's block when assembled", () => {
    const bff = EXPLODED.find((part) => part.id === "bff");
    const bodies = bff?.subs.flatMap((sub) =>
      sub.blocks.filter((block) => !block.kind),
    );
    expect(blockBounds(bodies ?? [])).toEqual({
      min: [130, 0, 0],
      max: [200, 70, 54],
    });
  });

  it("sits everything in place when assembled and lifts it when apart", () => {
    for (const part of EXPLODED) {
      for (const sub of part.subs) {
        expect(subOffset(part, sub, 0, 1).map(Math.abs)).toEqual([0, 0, 0]);
        if (!part.base) {
          expect(subOffset(part, sub, 1)[2]).toBeGreaterThan(0);
        }
      }
    }
  });
});
