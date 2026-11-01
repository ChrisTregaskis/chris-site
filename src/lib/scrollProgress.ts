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
    if (progress >= (i + 0.2) / count - 0.001) passed = i + 1;
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
