/**
 * The maths behind a scroll story whose steps are selected by scrolling them
 * across a horizontal focus line, or by clicking (which scrolls the step to
 * that line). Framework-free so it can be tested on its own.
 */

export interface VerticalRect {
  top: number;
  bottom: number;
  height: number;
}

/**
 * IntersectionObserver rootMargin for a 12px band centred on the focus line.
 * Always well formed, even mid-resize when the line can sit outside the
 * viewport (a doubled minus sign makes the observer throw).
 */
export function focusBandMargin(
  focusY: number,
  viewportHeight: number,
): string {
  const inset = (value: number) => Math.max(0, Math.round(value)) || 0;
  const top = inset(focusY - 6);
  const bottom = inset(viewportHeight - focusY - 6);
  return `-${top}px 0px -${bottom}px 0px`;
}

/** The 1-based step whose box spans the focus line, or 0 when none does. */
export function stepAtFocus(
  rects: (Pick<VerticalRect, "top" | "bottom"> | null)[],
  focusY: number,
): number {
  const index = rects.findIndex(
    (rect) => rect !== null && rect.top <= focusY && rect.bottom > focusY,
  );
  return index + 1;
}

/** Where a click lines its card up: its middle on the focus line, or its bottom near the viewport's bottom. */
export type FocusAlign = "focus" | "end";

/**
 * How far to scroll so a card's middle sits on the focus line. A card whose
 * top would then sit above `topLimit` (one taller than the room, or one that
 * would slide under the sticky top bar) lines its top up with `topLimit`
 * instead, unless `align` is `"end"`: then a card too tall for the room lines
 * its bottom up 16px above the viewport's bottom, so what ends it (a chat
 * input) is in view. Returns 0 when it is already there (within 2px).
 */
export function scrollDeltaToFocus(
  card: Pick<VerticalRect, "top" | "height">,
  focusY: number,
  viewportHeight: number,
  topLimit: number,
  align: FocusAlign = "focus",
): number {
  let delta = card.top + card.height / 2 - focusY;
  const tooTall = card.height > viewportHeight - topLimit - 20;
  if (tooTall && align === "end") {
    delta = card.top + card.height - (viewportHeight - 16);
  } else if (tooTall || card.top - delta < topLimit) {
    delta = card.top - topLimit;
  }
  return Math.abs(delta) < 2 ? 0 : delta;
}

/** How far into the room under a pinned figure a card's top must rise before it is selected. */
export const READING_DEPTH = 0.25;

/**
 * The reading line for a stacked (phone) scroll story: a quarter of the way
 * down the room left beneath the pinned figure (at least 24px into it). A card
 * is selected as its top rises past this line, so by then most of it (or all
 * of it) is on screen and the figure changes once you can read why. Never
 * lower than 24px above the viewport's bottom, so the line stays on screen.
 */
export function readingLine(
  stageBottom: number,
  viewportHeight: number,
): number {
  const room = viewportHeight - stageBottom;
  return Math.min(
    stageBottom + Math.max(24, room * READING_DEPTH),
    viewportHeight - 24,
  );
}

/** What crosses the focus line to select a step: its whole scroll box, or just its card. */
export type StepTrack = "step" | "card";

export interface FocusLine {
  focusY: number;
  topLimit: number;
  track: StepTrack;
}

/**
 * Where the focus line sits. Side by side (desktop) it is the middle of the
 * viewport, a step is selected as its scroll box crosses it, and a card may
 * scroll no higher than 20px below `topClearance` (the sticky top bar).
 * Stacked (phone) the figure pins at the top, so the line is the reading line
 * in the room beneath it and the card itself (not its taller scroll box) has
 * to cross it.
 */
export function focusLine(
  viewportHeight: number,
  stackedStageBottom: number | null,
  topClearance = 0,
): FocusLine {
  if (stackedStageBottom === null) {
    return {
      focusY: viewportHeight * 0.5,
      topLimit: topClearance + 20,
      track: "step",
    };
  }
  return {
    focusY: readingLine(stackedStageBottom, viewportHeight),
    topLimit: stackedStageBottom + 20,
    track: "card",
  };
}
