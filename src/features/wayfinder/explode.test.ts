import { describe, expect, it } from "vitest";
import {
  DRAW_ITEMS,
  type ExplodeAmounts,
  INSIDE,
  itemKey,
  layoutAt,
  SUBS,
} from "./explode";
import { PART_ORDER, type PartId, PLATFORM_INDEXES } from "./parts";
import { behind, drawingsOverlap, interpenetrate } from "@/lib/isoDepth";

const noFocus = Object.fromEntries(PART_ORDER.map((p) => [p, 0])) as Record<
  PartId,
  number
>;
const focusOn = (part: PartId | null, amount = 1) => ({
  ...noFocus,
  ...(part ? { [part]: amount } : {}),
});

/** Every unordered pair of indexes below n. */
const pairs = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n - i - 1 }, (__, k): [number, number] => [
      i,
      i + k + 1,
    ]),
  ).flat();

/** Every state the animation passes through, sampled finely. */
function* samples(): Generator<[string, ExplodeAmounts]> {
  const steps = 60;
  for (const lite of [false, true]) {
    // Taking it apart (and putting it back), with and without a part in focus.
    for (const part of [null, ...PART_ORDER]) {
      for (let i = 0; i <= steps; i++) {
        const apart = i / steps;
        yield [
          `apart ${apart} focus ${part} lite ${lite}`,
          { apart, focus: focusOn(part), lite },
        ];
      }
    }
    // Moving the focus from one part to the next while taken apart.
    for (const from of PART_ORDER) {
      for (const to of PART_ORDER) {
        if (from === to) continue;
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          yield [
            `focus ${from}→${to} ${t} lite ${lite}`,
            { apart: 1, focus: { ...noFocus, [from]: 1 - t, [to]: t }, lite },
          ];
        }
      }
    }
  }
}

describe("the exploded Wayfinder figure", () => {
  it("never moves one piece (or seating axis) through another, so a back-to-front order always exists", () => {
    const failures: string[] = [];
    for (const platform of PLATFORM_INDEXES) {
      for (const [label, amounts] of samples()) {
        const { boxes } = layoutAt(amounts, platform);
        for (const [i, j] of pairs(boxes.length)) {
          if (interpenetrate(boxes[i], boxes[j], 0.01)) {
            failures.push(
              `${label}: ${itemKey(DRAW_ITEMS[i])} × ${itemKey(DRAW_ITEMS[j])}`,
            );
          }
        }
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
  });

  it("paints every overlapping pair back to front, in every sampled state", () => {
    const failures: string[] = [];
    for (const [label, amounts] of samples()) {
      const { boxes, order } = layoutAt(amounts);
      const rank = order.map((_, index) => order.indexOf(index));
      for (const [i, j] of pairs(boxes.length)) {
        if (!drawingsOverlap(boxes[i], boxes[j])) continue;
        const iFirst = behind(boxes[i], boxes[j]);
        if (iFirst !== null && iFirst !== rank[i] < rank[j]) {
          failures.push(
            `${label}: ${itemKey(DRAW_ITEMS[i])} / ${itemKey(DRAW_ITEMS[j])} in the wrong order`,
          );
        }
      }
    }
    expect(failures.slice(0, 10)).toEqual([]);
  });

  it("seats every piece exactly where it was when assembled", () => {
    const { offset } = layoutAt({ apart: 0, focus: noFocus, lite: false });
    for (const sub of SUBS) expect(offset.get(sub.id)).toEqual([0, 0, 0]);
  });

  it("lists every part's pieces in number order", () => {
    expect(INSIDE.bff.map((piece) => piece.id)).toEqual([
      "2.1",
      "2.2",
      "2.3",
      "2.4",
    ]);
    for (const part of PART_ORDER) {
      expect(INSIDE[part].length).toBeGreaterThan(2);
    }
  });
});
