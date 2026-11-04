import { describe, expect, it } from "vitest";
import {
  type Bounds,
  drawnBounds,
  layoutAt,
  PLATE_PIECE,
  settled,
  SUBS,
} from "./explode";
import { type Point } from "./iso";
import { PART_ORDER, PLATFORM_INDEXES } from "./parts";
import {
  badgeBounds,
  tagBox,
  tagLayout,
  type TagSpec,
  tierShift,
} from "./tags";

/**
 * User units per CSS px where the figure settles: wide screens at 1280,
 * 1440 and 1920 (it grows while apart), then a tablet and two phones.
 */
const WIDE = [1.47, 1.33, 1.1];
const STACKED = [1.3, 2.57, 3.19];

const overlap = (a: Bounds, b: Bounds) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Whether two segments cross (touching ends don't count). */
function cross([a, b]: [Point, Point], [c, d]: [Point, Point]) {
  const side = (p: Point, q: Point, r: Point) =>
    Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
}

/** Each part's tags, settled, with each leader as drawn (dot to end). */
function* everyPart() {
  for (const lite of [false, true]) {
    for (const u of lite ? STACKED : WIDE) {
      for (const platform of PLATFORM_INDEXES) {
        const placed = tagLayout(lite, u, platform);
        for (const part of PART_ORDER) {
          const amounts = settled(part, lite);
          const layout = layoutAt(amounts, platform);
          const tags = [...placed.tags.values()].filter(
            (tag) => tag.part === part,
          );
          const dot = (tag: TagSpec): Point => {
            const o = tag.sub ? layout.offset.get(tag.sub) : undefined;
            const [x, y] = tag.at;
            return o
              ? [x + (o[0] - o[1]) * 0.866, y + (o[0] + o[1]) * 0.5 - o[2]]
              : tag.at;
          };
          yield {
            label: `${part} lite ${lite} at ${u} units/px on ${platform}`,
            part,
            u,
            tags,
            leaders: tags.map((tag): [Point, Point] => [dot(tag), tag.end]),
            layout,
            amounts,
            covers: placed.covers[part],
          };
        }
      }
    }
  }
}

describe("the exploded figure's number tags", () => {
  it("tags every piece, and the plate", () => {
    const { tags } = tagLayout(false, 1.3);
    expect(tags.size).toBe(SUBS.length + 1);
    expect(tags.get(PLATE_PIECE.id)?.sub).toBeNull();
  });

  it("never sets two of a part's numbers on top of each other", () => {
    const failures: string[] = [];
    for (const { label, tags, u } of everyPart()) {
      tags.forEach((a, i) => {
        for (const b of tags.slice(i + 1)) {
          if (overlap(tagBox(a, u), tagBox(b, u))) {
            failures.push(`${label}: ${a.id} on ${b.id}`);
          }
        }
      });
    }
    expect(failures).toEqual([]);
  });

  it("keeps every number clear of its own part's pieces", () => {
    const failures: string[] = [];
    for (const { label, tags, u, layout, part } of everyPart()) {
      const pieces = SUBS.filter((sub) => sub.part === part).flatMap((sub) =>
        sub.boxes.map((b) => drawnBounds(b, layout.offset.get(sub.id))),
      );
      for (const tag of tags) {
        if (pieces.some((piece) => overlap(tagBox(tag, u), piece))) {
          failures.push(`${label}: ${tag.id}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("never crosses one leader over another", () => {
    const failures: string[] = [];
    for (const { label, tags, leaders } of everyPart()) {
      leaders.forEach((a, i) => {
        leaders.slice(i + 1).forEach((b, k) => {
          if (cross(a, b)) {
            failures.push(`${label}: ${tags[i].id} × ${tags[i + k + 1].id}`);
          }
        });
      });
    }
    expect(failures).toEqual([]);
  });

  it("lists every other badge its numbers would cover, so that badge steps aside", () => {
    const failures: string[] = [];
    for (const {
      label,
      tags,
      u,
      layout,
      amounts,
      part,
      covers,
    } of everyPart()) {
      for (const other of PART_ORDER) {
        if (other === part || covers.includes(other)) continue;
        const badge = badgeBounds(other, layout, amounts);
        for (const tag of tags) {
          if (overlap(tagBox(tag, u), badge)) {
            failures.push(`${label}: ${tag.id} on badge ${other}`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("keeps every number on screen on a phone, where the figure spans the width", () => {
    // The viewBox runs from -290 to 630; the page's gutter is at least 16px.
    const failures: string[] = [];
    for (const { label, tags, u } of everyPart()) {
      if (!label.includes("lite true")) continue;
      for (const tag of tags) {
        const box = tagBox(tag, u);
        if (box.left < -290 - 12 * u || box.right > 630 + 12 * u) {
          failures.push(`${label}: ${tag.id}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("lines a part's numbers up: one column, one row, or one line along the plan", () => {
    for (const { label, tags } of everyPart()) {
      const bySide = new Map<string, TagSpec[]>();
      for (const tag of tags) {
        bySide.set(tag.side, [...(bySide.get(tag.side) ?? []), tag]);
      }
      for (const [side, line] of bySide) {
        const ends = line.map((tag) => tag.end);
        if (side === "left" || side === "right") {
          expect(new Set(ends.map(([x]) => x.toFixed(3))).size, label).toBe(1);
        } else if (side === "above" || side === "below") {
          expect(new Set(ends.map(([, y]) => y.toFixed(3))).size, label).toBe(
            1,
          );
        } else {
          // Along the plan's x axis: every step is 0.866 across to 0.5 down.
          const [first, ...rest] = ends;
          for (const [x, y] of rest) {
            expect((y - first[1]) / (x - first[0]), label).toBeCloseTo(
              0.5 / 0.866,
              3,
            );
          }
        }
      }
    }
  });

  it("moves numbers with their part's tier, and not at all once settled or on a phone", () => {
    expect(tierShift("bff", settled("bff", false))).toEqual([0, 0]);
    expect(tierShift("bff", settled("bff", true))).toEqual([0, 0]);
    const [, dy] = tierShift("bff", { ...settled("bff", false), apart: 0 });
    // Assembled, the tier is all the way down: the numbers sit lower.
    expect(dy).toBeGreaterThan(0);
  });
});
