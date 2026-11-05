import { type RefObject, useLayoutEffect, useState } from "react";
import { type DepthFit, fitDepth, sameFit } from "./fitDepth";

/**
 * Whether the 3D stack fits the pinned stage, and at what scale, measured
 * on mount and on resize only (never per frame). Height is the document's
 * client height: on phones and tablets that's the small viewport, so the
 * browser's bars sliding away on scroll never change it. Null before the
 * first measure, which runs before the first paint.
 */
export function useDepthFit(
  stageRef: RefObject<HTMLElement>,
  stacked: boolean,
): DepthFit | null {
  const [fit, setFit] = useState<DepthFit | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
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
  }, [stageRef, stacked]);

  return fit;
}
