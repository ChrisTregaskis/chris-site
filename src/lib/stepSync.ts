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

/** IntersectionObserver rootMargin for a 12px band centred on the focus line. */
export function focusBandMargin(
  focusY: number,
  viewportHeight: number,
): string {
  const top = Math.round(focusY - 6);
  const bottom = Math.round(viewportHeight - focusY - 6);
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

/**
 * How far to scroll so a card's middle sits on the focus line. A card taller
 * than the room below `topLimit` lines its top up with `topLimit` instead.
 * Returns 0 when it is already there (within 2px).
 */
export function scrollDeltaToFocus(
  card: Pick<VerticalRect, "top" | "height">,
  focusY: number,
  viewportHeight: number,
  topLimit: number,
): number {
  let delta = card.top + card.height / 2 - focusY;
  if (card.height > viewportHeight - topLimit - 20) delta = card.top - topLimit;
  return Math.abs(delta) < 2 ? 0 : delta;
}

/**
 * Where the focus line sits. Side by side (desktop) it is the middle of the
 * viewport; stacked (phone) the figure pins at the top, so the line sits 42%
 * of the way down the room left beneath it.
 */
export function focusLine(
  viewportHeight: number,
  stackedStageBottom: number | null,
): { focusY: number; topLimit: number } {
  if (stackedStageBottom === null) {
    return { focusY: viewportHeight * 0.5, topLimit: 20 };
  }
  return {
    focusY: stackedStageBottom + (viewportHeight - stackedStageBottom) * 0.42,
    topLimit: stackedStageBottom + 20,
  };
}
