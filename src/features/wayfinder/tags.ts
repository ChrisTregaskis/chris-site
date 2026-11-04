/**
 * Where the exploded figure's number tags go. Each piece of the part in focus
 * gets a tag: a dot on the piece, a straight leader, and its number. A part's
 * tags line up like callouts on a technical drawing, in a column beside it or
 * a row above or below it, clear of its pieces, and spread
 * along that line so no two touch. Tags are set at a fixed size on screen
 * (13px, however large the figure is drawn), so the layout takes the
 * drawing's scale.
 *
 * Pure: everything is in the SVG's user units, worked out for the settled
 * state (taken apart, the part in focus). While pieces move, each dot rides
 * its piece and each number rides its part's tier (`tierShift`), so a row or
 * column of numbers stays a row or column.
 */
import {
  badgeOffset,
  type Bounds,
  type Box3,
  drawnBounds,
  type ExplodeAmounts,
  layoutAt,
  type Layout,
  must,
  PLAN,
  PLATE_BOX,
  PLATE_PIECE,
  pieceApart,
  project,
  settled,
  SUBS,
  type TagSide,
  unionBounds,
  type Vec3,
} from "./explode";
import { BADGES, iso, type Point } from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { spreadApart } from "@/lib/spread";

/** Tag sizes in CSS px, the same however large the figure is drawn. */
export const TAG_PX = {
  /** The number's font size. */
  font: 13,
  /** Between neighbouring numbers in a column. */
  line: 21,
  /** Between neighbouring numbers in a row, beyond their widths. */
  space: 12,
  /** From the part's outline to the line the numbers sit on. */
  gap: 16,
  /** From the leader's end to the number. */
  pad: 4,
  /** The dot's radius. */
  dot: 2.25,
} as const;

/** A number's rough width in ems (Figtree's tabular figures and its point). */
const EM_PER_CHAR = 0.6;

/** A part's badge radius: 15 units, or 24 on phones (see `PartBadge`). */
const badgeRadius = (lite: boolean) => (lite ? 24 : 15);

export interface TagSpec {
  id: string;
  part: PartId;
  /** The piece it rides (null for the plate, which never moves). */
  sub: string | null;
  /** Its dot, on the piece where it sits assembled. */
  at: Point;
  /** Where the leader ends, settled. */
  end: Point;
  /** Where the number is drawn, settled, and which way it hangs off that point. */
  text: Point;
  anchor: "start" | "middle" | "end";
  side: TagSide;
  /** The line it shares with its neighbours (a part's pieces, or the plate alone). */
  line: string;
}

/** One box around all of a piece's boxes (plan units). */
function hull(boxes: readonly Box3[]): Box3 {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const z = Math.min(...boxes.map((b) => b.z));
  return {
    x,
    y,
    z,
    w: Math.max(...boxes.map((b) => b.x + b.w)) - x,
    d: Math.max(...boxes.map((b) => b.y + b.d)) - y,
    h: Math.max(...boxes.map((b) => b.z + b.h)) - z,
  };
}

/** Where a piece's dot sits for a side: the edge, top or foot facing it. */
function anchorOn(b: Box3, side: TagSide): Vec3 {
  const zMid = b.z + b.h / 2;
  switch (side) {
    case "left":
      return [b.x, b.y + b.d, zMid];
    case "right":
      return [b.x + b.w, b.y, zMid];
    case "above":
      return [b.x + b.w / 2, b.y + b.d / 2, b.z + b.h];
    case "front":
      return [b.x + b.w / 2, b.y + b.d, zMid];
    default:
      return [b.x + b.w / 2, b.y + b.d, b.z];
  }
}

interface Piece {
  id: string;
  sub: string | null;
  boxes: readonly Box3[];
  side: TagSide;
  /** Where its dot goes, if not where its side would put it. */
  anchor?: Vec3;
  /** Lines up on its own, apart from its part's pieces (the plate). */
  alone?: boolean;
}

function piecesOf(part: PartId, lite: boolean): Piece[] {
  const plan = PLAN[part];
  const side = lite ? (plan.liteTags ?? plan.tags) : plan.tags;
  const pieces: Piece[] = SUBS.filter((sub) => sub.part === part).map(
    (sub) => ({
      id: sub.id,
      sub: sub.id,
      boxes: sub.boxes,
      side: sub.tag ?? side,
    }),
  );
  if (part === "cloud") {
    // On the plate's front face, off to the right: clear of the pads' tags.
    const { x, y, z, w, d, h } = PLATE_BOX;
    pieces.push({
      id: PLATE_PIECE.id,
      sub: null,
      boxes: [PLATE_BOX],
      side: "front",
      anchor: [x + w * 0.7, y + d, z + h / 2],
      alone: true,
    });
  }
  return pieces;
}

const offsetOf = (layout: Layout, piece: Piece): Vec3 =>
  piece.sub ? must(layout.offset, piece.sub) : [0, 0, 0];

const textWidth = (id: string, font: number) => id.length * EM_PER_CHAR * font;

/** A part's badge, settled, as bounds. */
export function badgeBounds(
  part: PartId,
  layout: Layout,
  amounts: ExplodeAmounts,
): Bounds {
  const { cx, cy } = BADGES[part];
  const [ox, oy] = project(badgeOffset(part, layout, amounts));
  const r = badgeRadius(amounts.lite);
  return {
    left: cx + ox - r,
    right: cx + ox + r,
    top: cy + oy - r,
    bottom: cy + oy + r,
  };
}

/** Clear space kept around another part's badge, px. */
const BADGE_CLEAR = 3;

/** A plan step along y (towards the viewer, down-left on the page). */
const FRONT: Point = [-0.866, 0.5];

const overlaps = (a: Bounds, b: Bounds) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** How near a line segment passes to a point. */
function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Whether a settled tag (its number or its leader) covers a badge. */
function covers(tag: TagSpec, badgeBox: Bounds, settledDot: Point, u: number) {
  const r = (badgeBox.right - badgeBox.left) / 2;
  const centre: Point = [badgeBox.left + r, badgeBox.top + r];
  const clear = BADGE_CLEAR * u;
  const box = tagBox(tag, u);
  return (
    overlaps(
      {
        left: box.left - clear,
        right: box.right + clear,
        top: box.top - clear,
        bottom: box.bottom + clear,
      },
      badgeBox,
    ) || distanceToSegment(centre, settledDot, tag.end) < r + clear
  );
}

interface Dot {
  /** Where it sits on the piece, assembled. */
  at: Point;
  /** And settled, taken apart (page and plan). */
  settled: Point;
  plan: Vec3;
}

/**
 * Lines a group of tags up on one side of its pieces: their numbers spread
 * along the line, and each leader runs from its dot to its number.
 */
function lineUp(
  group: readonly Piece[],
  dots: readonly Dot[],
  outline: Bounds,
  side: TagSide,
  u: number,
): Omit<TagSpec, "part" | "line">[] {
  const font = TAG_PX.font * u;
  const gap = TAG_PX.gap * u;
  const pad = TAG_PX.pad * u;
  const widest = Math.max(...group.map((p) => textWidth(p.id, font)));
  const base = (piece: Piece, k: number) => ({
    id: piece.id,
    sub: piece.sub,
    at: dots[k].at,
    side,
  });

  if (side === "left" || side === "right") {
    const x = side === "left" ? outline.left - gap : outline.right + gap;
    const ys = spreadApart(
      dots.map((dot) => dot.settled[1]),
      TAG_PX.line * u,
    );
    return group.map((piece, k) => ({
      ...base(piece, k),
      end: [x, ys[k]],
      text: [side === "left" ? x - pad : x + pad, ys[k]],
      anchor: side === "left" ? "end" : "start",
    }));
  }

  if (side === "front") {
    // Along a line parallel to the plan's x axis, in front of the pieces:
    // each leader runs straight towards the viewer, with the drawing's grain.
    const y = Math.max(...dots.map((dot) => dot.plan[1])) + gap;
    const z = Math.min(...dots.map((dot) => dot.plan[2]));
    // Neighbours along that line part sideways (0.866) and down (0.5) at
    // once; whichever clears a number first is enough.
    const step =
      Math.min(widest / 0.866, (font * 1.2) / 0.5) + TAG_PX.space * u;
    const xs = spreadApart(
      dots.map((dot) => dot.plan[0]),
      step,
    );
    return group.map((piece, k) => {
      const end = iso(xs[k], y, z);
      return {
        ...base(piece, k),
        end,
        text: [end[0] + FRONT[0] * pad, end[1] + FRONT[1] * pad + font * 0.4],
        anchor: "end",
      };
    });
  }

  const y = side === "above" ? outline.top - gap : outline.bottom + gap;
  const xs = spreadApart(
    dots.map((dot) => dot.settled[0]),
    widest + TAG_PX.space * u,
  );
  const textY = side === "above" ? y - pad - font * 0.5 : y + pad + font * 0.5;
  return group.map((piece, k) => ({
    ...base(piece, k),
    end: [xs[k], y],
    text: [xs[k], textY],
    anchor: "middle",
  }));
}

export interface TagLayout {
  /** Every piece's tag (and the plate's), by its number. */
  tags: Map<string, TagSpec>;
  /**
   * The other parts' badges each part's tags would cover, settled: those
   * step aside while its tags show, as its own badge does.
   */
  covers: Record<PartId, PartId[]>;
}

/**
 * Every tag's place, for each part as it settles in focus. `unitsPerPx` is
 * how many of the SVG's user units make one CSS px once the figure settles
 * (it grows on wide screens while taken apart). On phones (`lite`) only the
 * part in focus opens, in place.
 */
export function tagLayout(
  lite: boolean,
  unitsPerPx: number,
  platform: PlatformIndex = 1,
): TagLayout {
  const u = unitsPerPx;
  const tags = new Map<string, TagSpec>();
  const covered = {} as Record<PartId, PartId[]>;

  for (const part of PART_ORDER) {
    const amounts = settled(part, lite);
    const layout = layoutAt(amounts, platform);
    const pieces = piecesOf(part, lite);
    const hits = new Set<PartId>();

    const lineOf = (piece: Piece) =>
      `${piece.side}${piece.alone ? `:${piece.id}` : ""}`;
    for (const line of new Set(pieces.map(lineOf))) {
      const group = pieces.filter((piece) => lineOf(piece) === line);
      const { side } = group[0];
      // The part's own badge steps aside while its tags show (see
      // `useExplode`), so the line need only clear its pieces.
      const outline = unionBounds(
        group.flatMap((piece) =>
          piece.boxes.map((b) => drawnBounds(b, offsetOf(layout, piece))),
        ),
      );
      const dots = group.map((piece): Dot => {
        const anchor = piece.anchor ?? anchorOn(hull(piece.boxes), side);
        const o = offsetOf(layout, piece);
        const plan: Vec3 = [
          anchor[0] + o[0],
          anchor[1] + o[1],
          anchor[2] + o[2],
        ];
        return { at: iso(...anchor), settled: iso(...plan), plan };
      });

      lineUp(group, dots, outline, side, u).forEach((placed, k) => {
        const tag = { ...placed, part, line };
        tags.set(tag.id, tag);
        for (const other of PART_ORDER) {
          if (other === part) continue;
          const badgeBox = badgeBounds(other, layout, amounts);
          if (covers(tag, badgeBox, dots[k].settled, u)) hits.add(other);
        }
      });
    }
    covered[part] = [...hits];
  }
  return { tags, covers: covered };
}

/** A tag's number as a box on the page (user units), where it settles. */
export function tagBox(tag: TagSpec, unitsPerPx: number): Bounds {
  const font = TAG_PX.font * unitsPerPx;
  const width = textWidth(tag.id, font);
  const [x, y] = tag.text;
  const left =
    tag.anchor === "end"
      ? x - width
      : tag.anchor === "middle"
        ? x - width / 2
        : x;
  return {
    left,
    right: left + width,
    top: y - font * 0.5,
    bottom: y + font * 0.5,
  };
}

/**
 * How far a part's numbers are from where they settle, for the given amounts:
 * they ride the part's tier as it lifts (from where its first piece starts),
 * and keep still while its pieces open and close within it. On phones the
 * part opens in place, so they never move.
 */
export function tierShift(part: PartId, amounts: ExplodeAmounts): Point {
  if (amounts.lite) return [0, 0];
  const plan = PLAN[part];
  const short = 1 - pieceApart(amounts.apart, plan.delay);
  if (short === 0) return [0, 0];
  const [x, y] = project(plan.lift);
  return [-x * short, -y * short];
}
