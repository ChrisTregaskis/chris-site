const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Progress through a pinned runway: 0 when the run's top reaches `pinTop`
 * (where its content pins), 1 after `runway` more pixels of scroll.
 */
export function runwayProgress(
  runTop: number,
  pinTop: number,
  runway: number,
): number {
  return runway > 0 ? clamp01((pinTop - runTop) / runway) : 1;
}

/**
 * Progress through a tall section whose content sticks at `stickTop`: 0 as it
 * sticks, 1 as it is about to scroll away.
 */
export function stickyProgress(
  top: number,
  height: number,
  viewportHeight: number,
  stickTop = 0,
): number {
  const travel = height - (viewportHeight - stickTop);
  return travel > 0 ? clamp01((stickTop - top) / travel) : 1;
}

/**
 * How many of `count` milestones a 0 to 1 progress has passed. Each lights a
 * little after its share of the run begins (b3: at (i + 0.2) / count).
 */
export function milestonesPassed(progress: number, count: number): number {
  let passed = 0;
  for (let i = 0; i < count; i++) {
    if (progress >= milestoneAt(i, count) - 0.001) passed = i + 1;
  }
  return passed;
}

/**
 * Progress of an element through the viewport: 0 as its top enters at the
 * bottom, 1 as its bottom leaves at the top.
 */
export function viewportProgress(
  top: number,
  height: number,
  viewportHeight: number,
): number {
  return clamp01((viewportHeight - top) / (viewportHeight + height));
}

/**
 * Where a pinned panel of `height` sits, from the viewport top: centred, but
 * at least 16px below the sticky bar (`clearance`). One too tall for the room
 * under the bar lines its bottom up 16px above the viewport's bottom instead,
 * so whatever plays out in it stays in view while it is pinned.
 */
export function pinTopFor(
  viewportHeight: number,
  height: number,
  clearance = 0,
): number {
  const top = Math.max(clearance + 16, (viewportHeight - height) / 2);
  return top + height > viewportHeight - 16
    ? viewportHeight - height - 16
    : top;
}

/** Where milestone `index` (0-based) of `count` lights, as a 0 to 1 progress. */
export function milestoneAt(index: number, count: number): number {
  return (index + 0.2) / count;
}

/**
 * Progress through one stretch of a run: 0 until `progress` reaches `from`,
 * 1 from `to` on (a branch that plays out between two milestones).
 */
export function segmentProgress(
  progress: number,
  from: number,
  to: number,
): number {
  return to > from
    ? clamp01((progress - from) / (to - from))
    : +(progress >= to);
}
