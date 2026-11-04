import { describe, expect, it } from "vitest";
import {
  CARTRIDGE_LIFT,
  DRAW_ITEMS,
  type ExplodeAmounts,
  INSIDE,
  itemKey,
  layoutAt,
  PLATE_PIECE,
  pipeRetract,
  ROUTE_PARTS,
  settled,
  SUBS,
} from "./explode";
import { ROUTE_KEYS } from "./iso";
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

  it("seats every piece exactly where it was when assembled, the cartridges not live lifted as on the board", () => {
    const { offset, axis } = layoutAt(settled(null, false, false), 2);
    for (const sub of SUBS) {
      const lifted = sub.platform !== undefined && sub.platform !== 2;
      expect(offset.get(sub.id)).toEqual([0, 0, lifted ? CARTRIDGE_LIFT : 0]);
      // Assembled, nothing has left a gap to draw an axis in.
      const [from, to] = axis.get(sub.id) ?? [];
      expect(from).toEqual(to);
    }
  });

  it("lifts a cartridge part way while a platform swap is under way", () => {
    const { offset } = layoutAt(settled(null, false, false), [0, 0.5, 1]);
    expect(offset.get("6.1")?.[2]).toBe(0);
    expect(offset.get("6.2")?.[2]).toBe(CARTRIDGE_LIFT / 2);
    expect(offset.get("6.3")?.[2]).toBe(CARTRIDGE_LIFT);
  });

  it("draws every pipe off once the board is apart, and back on assembled", () => {
    const apart = pipeRetract(settled(null, false));
    const whole = pipeRetract(settled(null, false, false));
    for (const key of ROUTE_KEYS) {
      expect(apart[key]).toBe(1);
      expect(whole[key]).toBe(0);
    }
    // Half way through coming apart, every pipe is already gone.
    const half = pipeRetract({ ...settled(null, false), apart: 0.5 });
    expect(Object.values(half).every((off) => off === 1)).toBe(true);
  });

  it("on phones, draws off only the pipes of the part that is open", () => {
    for (const part of PART_ORDER) {
      const retract = pipeRetract(settled(part, true));
      for (const key of ROUTE_KEYS) {
        expect(retract[key]).toBe(ROUTE_PARTS[key].includes(part) ? 1 : 0);
      }
    }
    // The intro on a phone: nothing opens, so every pipe stays drawn.
    const intro = pipeRetract(settled(null, true));
    expect(Object.values(intro).every((off) => off === 0)).toBe(true);
  });

  it("on phones, opens only the part in focus, where it stands", () => {
    const { offset } = layoutAt(settled("bff", true));
    for (const sub of SUBS) {
      const o = offset.get(sub.id) ?? [0, 0, 0];
      const moved = o.some((value) => value !== 0);
      if (sub.part !== "bff") {
        // Only the cartridges not live stand lifted, as on the board.
        expect(o[0]).toBe(0);
        expect(o[1]).toBe(0);
      } else if (sub.id !== "2.1") {
        expect(moved).toBe(true);
      }
    }
  });

  it("lists every part's pieces in number order, numbered by part", () => {
    expect(INSIDE.bff.map((piece) => piece.id)).toEqual([
      "2.1",
      "2.2",
      "2.3",
      "2.4",
    ]);
    PART_ORDER.forEach((part, index) => {
      const ids = INSIDE[part].map((piece) => piece.id);
      expect(ids.length).toBeGreaterThan(2);
      expect(ids).toEqual(ids.map((_, k) => `${index + 1}.${k + 1}`));
    });
    expect(INSIDE.cloud.at(-1)?.id).toBe(PLATE_PIECE.id);
  });
});
