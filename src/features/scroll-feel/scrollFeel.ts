/**
 * The scroll-feel prototypes, picked with `?scroll=` (explore branch only).
 * Without the parameter, or with anything else, the page is the live site,
 * unchanged.
 *
 * - `b`, chapter progress: each case study's numeral at the window's edge,
 *   over a rail that fills as the chapter is read and settles once it's
 *   finished.
 * - `c`, dead-zone cues: a small cue in each stretch where scrolling
 *   otherwise changed nothing, each in its own chapter's terms.
 * - `bc`, the two together, as one system: violet says how far (the rails,
 *   the numerals, the count and its strain); amber says what's happening
 *   now (the build lane's spark, the set's calls).
 */
export const SCROLL_FEELS = ["b", "c", "bc"] as const;

export type ScrollFeel = (typeof SCROLL_FEELS)[number];

/** The prototype a query string asks for (`?scroll=bc`), or null for the live site. */
export function scrollFeelFrom(search: string): ScrollFeel | null {
  const value = new URLSearchParams(search).get("scroll");
  return SCROLL_FEELS.find((feel) => feel === value) ?? null;
}

/** Whether the chapters carry their progress rails (b). */
export function showsChapterRails(feel: ScrollFeel | null): boolean {
  return feel === "b" || feel === "bc";
}

/** Whether the dead stretches carry their cues (c). */
export function showsDeadZoneCues(feel: ScrollFeel | null): boolean {
  return feel === "c" || feel === "bc";
}
