import { smoothstep } from "./falloff";

/**
 * Where on the page the mesh lies, as a strength from 0 to 1 down the page.
 * At its `ends`: full in the hero, falling off with no edge as the work
 * begins, absent through the three case studies, rising again into About
 * and full through Contact to the foot of the page. A spatial fade, not an
 * animation: it's where the mesh is, not when.
 */

/** The page's sections that set the mesh's reach, in page px. */
export interface PageSections {
  heroTop: number;
  heroBottom: number;
  workTop: number;
  aboutTop: number;
  aboutBottom: number;
}

/** The two fades: out of the hero into the work, and back in at About. */
export interface Reach {
  outFrom: number;
  outTo: number;
  inFrom: number;
  inTo: number;
}

/**
 * The fades from the sections' real positions, so they hold at any width.
 * The hero's own height (about a screen) is the unit: the mesh starts to
 * fade three fifths of the way down the hero (under the headline, as the
 * rule and the actions come) and is gone a sixth of a hero into the work
 * (before the chapter's numeral). It starts back at About's top edge, so
 * the Burpees chapter never carries any, and is full three fifths of a hero
 * further down, or by Contact if About is shorter than that.
 */
export function endsReach(sections: PageSections): Reach {
  const unit = Math.max(1, sections.heroBottom - sections.heroTop);
  const about = Math.max(1, sections.aboutBottom - sections.aboutTop);
  return {
    outFrom: sections.heroTop + 0.6 * unit,
    outTo: sections.workTop + 0.16 * unit,
    inFrom: sections.aboutTop,
    inTo: sections.aboutTop + Math.min(0.6 * unit, about),
  };
}

/** The mesh's strength at page y: 1 everywhere without a reach (the whole page). */
export function reachAt(y: number, reach: Reach | null): number {
  if (!reach) return 1;
  const top = 1 - smoothstep(reach.outFrom, reach.outTo, y);
  const bottom = smoothstep(reach.inFrom, reach.inTo, y);
  return Math.max(top, bottom);
}

/** One stop of a vertical gradient: `offset` 0 to 1 down the band, `alpha` the reach there. */
export interface ReachStop {
  offset: number;
  alpha: number;
}

/**
 * The reach down a band of the page as gradient stops, every `step` px
 * (smoothstep's curve is drawn in short straight pieces, too short to see),
 * with runs of one value cut to their ends.
 */
export function reachStops(
  top: number,
  bottom: number,
  reach: Reach | null,
  step = 16,
): ReachStop[] {
  const height = Math.max(1, bottom - top);
  const all: ReachStop[] = [];
  for (let y = top; y < bottom + step; y += step) {
    const at = Math.min(y, bottom);
    all.push({ offset: (at - top) / height, alpha: reachAt(at, reach) });
    if (at === bottom) break;
  }
  return all.filter(
    (stop, i) =>
      i === 0 ||
      i === all.length - 1 ||
      stop.alpha !== all[i - 1].alpha ||
      stop.alpha !== all[i + 1].alpha,
  );
}

/** The most the mesh shows anywhere in a band: 0 means nothing to draw there. */
export function bandReach(
  top: number,
  bottom: number,
  reach: Reach | null,
): number {
  // The reach only falls and then rises, so its largest is at an end.
  return Math.max(reachAt(top, reach), reachAt(bottom, reach));
}
