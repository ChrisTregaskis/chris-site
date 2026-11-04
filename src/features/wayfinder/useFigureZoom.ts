import { type RefObject, useEffect, useState } from "react";
import { fitScale, zoomFor } from "./zoom";
import { frameThrottle } from "@/lib/frameThrottle";
import { topClearance } from "@/lib/topClearance";

/** How close to the window's left edge the grown figure may come, px. */
const EDGE_PX = 24;
/** Clear space kept under the top bar, px. */
const CEILING_PX = 12;

export interface FigureZoom {
  /** How much the figure grows while taken apart (1: not at all). */
  zoom: number;
  /** SVG user units per CSS px once it has grown (for fixed-size tags). */
  unitsPerPx: number;
}

const round = (n: number, step: number) => Math.round(n / step) * step;

/**
 * Measures how far the figure may grow while taken apart (see `zoom.ts`),
 * and so how large a CSS px is in its drawing once it has. Measured on mount
 * and on resize only: the box is laid out where the figure pins (`stage`,
 * a sticky element), so where the page is scrolled doesn't matter. `box`
 * is the figure's own, unscaled wrapper; off (`grow` false), it still
 * reports the drawing's scale.
 */
export function useFigureZoom(
  box: RefObject<HTMLElement | null>,
  stage: RefObject<HTMLElement | null> | undefined,
  grow: boolean,
): FigureZoom {
  const [fit, setFit] = useState<FigureZoom>({ zoom: 1, unitsPerPx: 1.6 });

  useEffect(() => {
    const element = box.current;
    if (!element) return undefined;
    const measure = frameThrottle(() => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const k = fitScale(rect.width, rect.height);
      let zoom = 1;
      const pin = stage?.current;
      if (grow && pin) {
        const pinRect = pin.getBoundingClientRect();
        const pinnedTop = parseFloat(getComputedStyle(pin).top) || 0;
        const top = pinnedTop + rect.top - pinRect.top;
        zoom = zoomFor({
          left: rect.left,
          right: rect.right,
          top,
          bottom: top + rect.height,
          ceiling: topClearance() + CEILING_PX,
          edge: EDGE_PX,
        });
      }
      // Rounded, so a 1px resize doesn't re-lay every tag.
      const next = {
        zoom: round(zoom, 0.01),
        unitsPerPx: round(1 / (k * zoom), 0.01),
      };
      setFit((previous) =>
        previous.zoom === next.zoom && previous.unitsPerPx === next.unitsPerPx
          ? previous
          : next,
      );
    });
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      measure.cancel();
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [box, stage, grow]);

  return fit;
}
