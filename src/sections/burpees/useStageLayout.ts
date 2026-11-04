import { type RefObject, useLayoutEffect, useState } from "react";
import {
  FULL_DIGITS,
  sameLayout,
  type StageLayout,
  stageLayout,
} from "./stageLayout";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

export interface MeasuredLayout extends StageLayout {
  /** How far the count's baseline sits above the bottom of its box, in ems of its size. */
  baseline: number;
}

/** Until measured: the breakpoint's layout, and Bricolage's baseline at a 0.8 line height. */
const UNMEASURED: MeasuredLayout = {
  fit: 1,
  beside: true,
  push: 0,
  baseline: 0.05,
};

const thousandths = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Lays the stage out from what the browser draws: a hidden ruler, "000" in
 * the count's type at its screen-driven size, gives one digit's width and
 * where the baseline sits (a zero-size box on it). Measured on mount, on
 * resize and once the webfonts are in, never per frame; the layout only
 * changes when the measure does.
 */
export function useStageLayout(
  grid: RefObject<HTMLElement>,
  ruler: RefObject<HTMLElement>,
  baselineMark: RefObject<HTMLElement>,
): MeasuredLayout {
  const [layout, setLayout] = useState(UNMEASURED);

  useLayoutEffect(() => {
    let frame = 0;
    let live = true;
    const measure = () => {
      frame = 0;
      const stage = grid.current;
      const type = ruler.current;
      const mark = baselineMark.current;
      if (!stage || !type || !mark) return;
      const box = type.getBoundingClientRect();
      const size = parseFloat(getComputedStyle(type).fontSize);
      const next: MeasuredLayout = {
        ...stageLayout({
          width: stage.getBoundingClientRect().width,
          gap: parseFloat(getComputedStyle(stage).columnGap) || 0,
          digit: box.width / FULL_DIGITS,
          wide: !window.matchMedia(BELOW_WIDE).matches,
        }),
        baseline:
          size > 0
            ? thousandths(
                (box.bottom - mark.getBoundingClientRect().top) / size,
              )
            : UNMEASURED.baseline,
      };
      setLayout((last) =>
        sameLayout(last, next) && last.baseline === next.baseline ? last : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("resize", schedule);
    // The fallback font draws different digits: measure again once it's swapped.
    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        if (live) schedule();
      });
    }
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [grid, ruler, baselineMark]);

  return layout;
}
