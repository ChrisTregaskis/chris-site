import { SET_REPS } from "./calls";

/** The count's share of the row when the calls sit beside it (1.25fr to 0.75fr). */
export const COUNT_SHARE = 1.25 / 2;

/** The narrowest the calls may be beside the count before they move under it, in px. */
export const MIN_CALLS_PX = 240;

/** Digits in a finished set (100), the widest the count gets. */
export const FULL_DIGITS = String(SET_REPS).length;

/** Digits while the calls are showing (up to 99): at 100 they step aside. */
const CALLING_DIGITS = FULL_DIGITS - 1;

export interface StageMetrics {
  /** The stage's content width, in px. */
  width: number;
  /** The gap between the count and the calls when side by side, in px. */
  gap: number;
  /** One digit's advance at the count's screen-driven size, before any fit, in px. */
  digit: number;
  /**
   * How far the digits' strokes may reach past their edges on each side, at
   * the same size, in px: the count's strain, 0 without it.
   */
  outset?: number;
  /** Whether the screen is wide enough for the calls to sit beside the count. */
  wide: boolean;
}

export interface StageLayout {
  /** The count's size as a share of its screen-driven size: 1 unless a finished set would run off the stage. */
  fit: number;
  /** The calls sit beside the count; otherwise under it, where Done comes in. */
  beside: boolean;
  /** How far the calls step right to clear a two-digit count drawn wider than its column, in px. */
  push: number;
}

/**
 * Where the stage puts things, from what the browser actually draws. The
 * count is sized by the screen, never to its column, and its digits may be
 * drawn far wider in one browser than another, so nothing can assume their
 * width:
 *
 * - The count only shrinks if 100 would run off the stage itself.
 * - Beside the count, the calls step right by as much as two digits run
 *   past their column, and go under the count if that leaves them too
 *   narrow. (At 100 they fade, and Done comes in under the count.)
 *
 * Strokes that reach past the digits (`outset`) count as part of them both
 * ways, so a straining count can never run off the stage or into the calls.
 */
export function stageLayout({
  width,
  gap,
  digit,
  outset = 0,
  wide,
}: StageMetrics): StageLayout {
  if (!(width > 0) || !(digit > 0)) return { fit: 1, beside: wide, push: 0 };
  const edges = 2 * Math.max(0, outset);
  const fit = Math.min(
    1,
    Math.floor((width / (digit * FULL_DIGITS + edges)) * 1000) / 1000,
  );
  if (!wide) return { fit, beside: false, push: 0 };
  const column = (width - gap) * COUNT_SHARE;
  const calls = width - gap - column;
  // The right edge of "99" as drawn: two digits and the stroke past them.
  const drawn = (digit * CALLING_DIGITS + edges / 2) * fit;
  const push = Math.max(0, Math.ceil(drawn - column));
  return calls - push >= MIN_CALLS_PX
    ? { fit, beside: true, push }
    : { fit, beside: false, push: 0 };
}

/** Whether two layouts would draw the same (so a re-measure can bail out). */
export function sameLayout(a: StageLayout, b: StageLayout): boolean {
  return a.fit === b.fit && a.beside === b.beside && a.push === b.push;
}
