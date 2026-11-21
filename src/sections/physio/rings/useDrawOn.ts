import { type RefObject, useEffect, useRef } from "react";
import { DRAW_PLANS, drawnAt, ease, shownAt } from "./draw";
import { STEP_ORDER } from "./story";

/** How long a step takes to draw, and to undraw (a touch quicker, going back). */
export const DRAW_MS = 900;
export const UNDRAW_MS = 600;
/** A frame longer than this (a hidden tab, a stall) is taken as this. */
const MAX_FRAME_MS = 64;

/**
 * Draws each step's part of the rings on as the reader reaches it, and off
 * again as they scroll back: every step has its own progress, 0 to 1,
 * eased toward its goal (drawn if it's the current step or before it), and
 * each frame writes what that progress means (`draw.ts`) straight to the
 * drawing: a line's mask drawn on so far, an icon's opacity. Steps move
 * together, not in turn, so a fast scroll across several draws (or undraws)
 * them all at once in one step's time, and never builds a backlog. A step
 * that's turned round mid-way carries on from where it is. Nothing here
 * touches colour, so a journey's lit route or a detail's highlight is never
 * fought over. Static (reduced motion): everything drawn at once.
 */
export function useDrawOn(
  svgRef: RefObject<SVGSVGElement>,
  current: number,
  still: boolean,
) {
  const progress = useRef<number[]>(STEP_ORDER.map(() => 0));
  const elements = useRef(new Map<string, Element[]>());

  // What can be drawn, by key: found once (the drawing's parts never change).
  useEffect(() => {
    const map = new Map<string, Element[]>();
    svgRef.current?.querySelectorAll("[data-draw]").forEach((element) => {
      const key = element.getAttribute("data-draw") ?? "";
      map.set(key, [...(map.get(key) ?? []), element]);
    });
    elements.current = map;
  }, [svgRef]);

  useEffect(() => {
    const goals = STEP_ORDER.map((_, index) =>
      still || index + 1 <= current ? 1 : 0,
    );

    const paint = (index: number) => {
      const plan = DRAW_PLANS[STEP_ORDER[index]];
      const p = ease(progress.current[index]);
      for (const stroke of plan.strokes) {
        const drawn = drawnAt(stroke, p);
        for (const element of elements.current.get(stroke.key) ?? []) {
          if (element instanceof SVGElement) {
            element.style.strokeDashoffset = String(1 - drawn);
          }
        }
      }
      for (const fade of plan.fades) {
        const shown = shownAt(fade, p);
        for (const element of elements.current.get(fade.key) ?? []) {
          if (element instanceof SVGElement) {
            element.style.opacity = String(shown);
            element.style.pointerEvents = shown > 0 ? "" : "none";
          }
        }
      }
    };

    if (still) {
      goals.forEach((goal, index) => {
        progress.current[index] = goal;
        paint(index);
      });
      return undefined;
    }

    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(MAX_FRAME_MS, now - last) : 16;
      last = now;
      let moving = false;
      for (const [index, goal] of goals.entries()) {
        const p = progress.current[index];
        if (p === goal) continue;
        const next =
          goal > p
            ? Math.min(goal, p + dt / DRAW_MS)
            : Math.max(goal, p - dt / UNDRAW_MS);
        progress.current[index] = next;
        paint(index);
        if (next !== goal) moving = true;
      }
      if (moving) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [current, still]);
}
