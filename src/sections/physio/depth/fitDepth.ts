import { STACK_H } from "../depth/depthGeometry";
import { QUERY_TYPE } from "../QueryLines";

/*
 * Where the 3D stack fits, and how far it can shrink and still be laid out
 * well, so it reaches tablets and smaller laptops. The stack is drawn at
 * full size and scaled as a whole; as it shrinks its type grows to match (up
 * to `MAX_BOOST`), so the text on the sheets stays the size it is on a
 * desktop (about 13.6px on screen, the em measured down the tilted sheet).
 * Below `MIN_SCALE` it would have to get smaller still, so the screen gets
 * the glass floor instead. Side by side that reaches about 930 x 649;
 * stacked above the steps, about 513 x 870 (tablets held upright).
 */

/** The smallest the stack may be scaled. */
export const MIN_SCALE = 0.82;

/** The most its type may grow to make up for the scale. */
export const MAX_BOOST = 1.2;

/**
 * Where the stack's ink reaches, in px from its own box at full size: the
 * policy plane overhangs the sheets on both sides (measured at 1440 x 900).
 */
export const DEPTH_INK = { left: 44, right: 531 } as const;

/** The sticky top bar (`--size-nav`). */
const NAV = 68;

/** Breathing room kept round the figure in the pinned column. */
const AIR = 16;

/** Side by side, the least room kept between the plane's overhang and the screen's edge. */
const EDGE = 8;

/** The figure's widest beside the steps (`max-w-[560px]`), centred in its column. */
const FIGURE_W = 560;

/** Side by side, the figure's fixed parts round the stack: picker row, the gap above the stack, the controls row. */
const SIDE_FIXED = 28 + 12 + 12 + 30;

/** The gap between the query and the stack, by query size, in px and as a class. */
const STACK_GAP = { large: 20, medium: 12 } as const;
export const STACK_GAP_CLASS = { large: "mt-5", medium: "mt-3" } as const;

/** Stacked (tablets), the panel's padding, and the room kept beneath it for the last step's card. */
const PANEL_PAD = 16;
export const CARD_ROOM = 320;

export type DepthQuerySize = "large" | "medium";

export interface DepthFit {
  /** The 3D stack fits here. */
  depth: boolean;
  /** Its scale, at most 1. */
  scale: number;
  /** How much its type grows to make up for the scale. */
  boost: number;
  /** The query's size above it: medium once the stack has shrunk. */
  query: DepthQuerySize;
  /** The figure's inset so the plane's overhang stays on screen (stacked, or a narrow gutter side by side). */
  inset: number;
}

export interface FitInput {
  /** The figure's room across: the pinned column side by side, the content width stacked. */
  width: number;
  /** The viewport's height (the small viewport on phones and tablets). */
  height: number;
  /** One column (below `wide`): the figure pins above the steps. */
  stacked: boolean;
  /** Side by side, the room left of the pinned column, out to the screen's edge (the page's gutter). */
  gutter?: number;
}

function round(value: number): number {
  return Math.floor(value * 1000) / 1000;
}

/** The stack's scale for its room down and across, with the query at a size and the figure inset. */
function scaleFor(
  { width, height, stacked }: FitInput,
  query: DepthQuerySize,
  inset = 0,
): number {
  const block = QUERY_TYPE[query].block + STACK_GAP[query];
  const across = stacked
    ? width / (DEPTH_INK.left + DEPTH_INK.right)
    : (width - inset) / DEPTH_INK.right;
  const down = stacked
    ? (height - NAV - PANEL_PAD - block - CARD_ROOM) / STACK_H
    : (height - NAV - 2 * AIR - SIDE_FIXED - block) / STACK_H;
  return Math.min(1, across, down);
}

/**
 * How far the figure steps in so the plane's overhang stays on screen:
 * stacked, all of it; side by side, only what the page's gutter (and the
 * figure's centring in its column) leaves short.
 */
function insetFor(input: FitInput, scale: number): number {
  const overhang = DEPTH_INK.left * scale;
  if (input.stacked) return Math.round(overhang);
  const figureLeft =
    (input.gutter ?? Infinity) + Math.max(0, (input.width - FIGURE_W) / 2);
  return Math.max(0, Math.ceil(overhang + EDGE - figureLeft));
}

/**
 * Whether the 3D stack fits, and at what scale. Full size where there's
 * room; otherwise shrunk (its query a size down to save height) until
 * `MIN_SCALE`, below which it doesn't fit.
 */
export function fitDepth(input: FitInput): DepthFit {
  const full = scaleFor(input, "large");
  const query: DepthQuerySize = full < 1 ? "medium" : "large";
  const first = query === "large" ? full : scaleFor(input, "medium");
  // A narrow gutter side by side steps the figure in, which leaves it a little less room across.
  const scale = round(
    Math.min(first, scaleFor(input, query, insetFor(input, first))),
  );
  const depth = scale >= MIN_SCALE;
  return {
    depth,
    scale,
    boost: round(Math.min(MAX_BOOST, 1 / Math.max(scale, 0.01))),
    query,
    inset: insetFor(input, scale),
  };
}

export function sameFit(a: DepthFit, b: DepthFit): boolean {
  return (
    a.depth === b.depth &&
    a.scale === b.scale &&
    a.boost === b.boost &&
    a.query === b.query &&
    a.inset === b.inset
  );
}
