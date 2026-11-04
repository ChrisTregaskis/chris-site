/**
 * How much the figure grows while it is taken apart, on wide screens. The
 * figure's column is narrow (about 560px), and taken apart its pieces are
 * small, so it scales up towards the page's empty left margin: from its
 * bottom-right corner, so it never moves into the step text beside it or the
 * picker under it, only up and to the left, as far as the room allows (below
 * the top bar, short of the window's edge) and no more than `MAX_ZOOM`.
 * Pure: the hook measures, this decides.
 */
import {
  badgeOffset,
  type Bounds,
  drawnBounds,
  layoutAt,
  project,
  settled,
  SUBS,
  unionBounds,
} from "./explode";
import { BADGES, VIEW_BOX } from "./iso";
import { PART_ORDER } from "./parts";

/** The most the figure grows. */
export const MAX_ZOOM = 1.5;

/** Room kept for a row of number tags above the topmost piece, px. */
const TAG_ROOM_PX = 40;

const [VB_X, VB_Y, VB_W, VB_H] = VIEW_BOX.split(" ").map(Number);

/**
 * Everything drawn while taken apart, whichever part is in focus: every
 * piece and badge, in user units.
 */
export const APART_EXTENT: Bounds = unionBounds(
  [null, ...PART_ORDER].flatMap((focus) => {
    const amounts = settled(focus, false);
    const layout = layoutAt(amounts);
    return [
      ...SUBS.flatMap((sub) =>
        sub.boxes.map((b) => drawnBounds(b, layout.offset.get(sub.id))),
      ),
      ...PART_ORDER.map((part) => {
        const { cx, cy } = BADGES[part];
        const [ox, oy] = project(badgeOffset(part, layout, amounts));
        return {
          left: cx + ox - 15,
          right: cx + ox + 15,
          top: cy + oy - 15,
          bottom: cy + oy + 15,
        };
      }),
    ];
  }),
);

export interface ZoomRoom {
  /** The figure's box (unscaled) where it pins, in viewport px. */
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** The highest the grown drawing may reach (just below the top bar), px. */
  ceiling: number;
  /** The nearest it may come to the window's left edge, px. */
  edge: number;
}

/** User units to px for an SVG drawn into a box (`meet`, centred). */
export function fitScale(width: number, height: number): number {
  return Math.min(width / VB_W, height / VB_H);
}

/** The scale the figure grows to while taken apart: 1 when there is no room. */
export function zoomFor(
  room: ZoomRoom,
  extent: Bounds = APART_EXTENT,
  max = MAX_ZOOM,
): number {
  const width = room.right - room.left;
  const height = room.bottom - room.top;
  if (width <= 0 || height <= 0) return 1;
  const k = fitScale(width, height);
  const x0 = room.left + (width - VB_W * k) / 2;
  const y0 = room.top + (height - VB_H * k) / 2;
  const left = x0 + (extent.left - VB_X) * k;
  const top = y0 + (extent.top - VB_Y) * k - TAG_ROOM_PX;
  // Grown from the bottom-right corner, a point d px from it ends up d·s away.
  const byLeft = (room.right - room.edge) / (room.right - left);
  const byTop = (room.bottom - room.ceiling) / (room.bottom - top);
  return Math.max(1, Math.min(max, byLeft, byTop));
}
