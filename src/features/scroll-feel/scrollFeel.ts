/**
 * The scroll-feel prototypes, picked with `?scroll=a|b|c` (explore branch
 * only). Without the parameter, or with anything else, the page is the live
 * site, unchanged.
 *
 * - `a`, night sky: a faint star field on the page's ground that drifts a
 *   little slower than the content (a CSS scroll-driven animation).
 * - `b`, chapter progress: each case study's numeral in the margin, over a
 *   rail that fills as the chapter is read.
 * - `c`, dead-zone cues: a small cue in each stretch where scrolling
 *   otherwise changed nothing, each in its own chapter's terms.
 */
export const SCROLL_FEELS = ["a", "b", "c"] as const;

export type ScrollFeel = (typeof SCROLL_FEELS)[number];

/** The prototype a query string asks for (`?scroll=b`), or null for the live site. */
export function scrollFeelFrom(search: string): ScrollFeel | null {
  const value = new URLSearchParams(search).get("scroll");
  return SCROLL_FEELS.find((feel) => feel === value) ?? null;
}
