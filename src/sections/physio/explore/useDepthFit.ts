import { type RefObject, useLayoutEffect, useState } from "react";
import { type DepthFit, fitDepth, sameFit } from "./fitDepth";

/**
 * Exploration: whether the 3D stack fits the pinned stage, and at what
 * scale, measured on mount and on resize only (never per frame). Height is
 * the document's client height: on phones and tablets that's the small
 * viewport, so the browser's bars sliding away on scroll never change it.
 * Null when off, or before the first measure (which runs before paint).
 */
export function useDepthFit(
  stageRef: RefObject<HTMLElement>,
  stacked: boolean,
  enabled: boolean,
): DepthFit | null {
  const [fit, setFit] = useState<DepthFit | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!enabled || !stage) return undefined;
    let frame = 0;
    const measure = () => {
      const next = fitDepth({
        width: stage.clientWidth,
        height: document.documentElement.clientHeight,
        stacked,
      });
      setFit((last) => (last && sameFit(last, next) ? last : next));
    };
    measure();
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [stageRef, stacked, enabled]);

  return enabled ? fit : null;
}
