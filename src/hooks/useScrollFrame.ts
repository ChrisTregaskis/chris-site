import { type RefObject, useEffect, useRef } from "react";

/** How far outside the viewport a watched element still counts as on screen. */
export const SCROLL_FRAME_MARGIN = "100px 0px";

/**
 * Calls `onFrame` once now, then at most once per animation frame while the
 * page scrolls or resizes (`resized` says a resize happened since the last
 * call, for anything worth measuring only then). For scroll-driven visuals
 * that write straight to the DOM or set coarse state; off when `enabled` is
 * false.
 *
 * Given a `watch` element, it skips the work while that element is off screen
 * (an IntersectionObserver, 100px of slack), with one call as it comes into
 * view to catch up and one as it leaves to settle on the final state.
 */
export function useScrollFrame(
  onFrame: (resized: boolean) => void,
  enabled = true,
  watch?: RefObject<Element | null>,
): void {
  const callback = useRef(onFrame);

  useEffect(() => {
    callback.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;
    let resized = false;
    let onScreen = true;
    const run = () => {
      frame = 0;
      const wasResized = resized;
      resized = false;
      callback.current(wasResized);
    };
    const schedule = () => {
      if (frame || !onScreen) return;
      frame = requestAnimationFrame(run);
    };
    const onResize = () => {
      resized = true;
      schedule();
    };

    const target = watch?.current;
    const observer =
      target && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting === onScreen) return;
              onScreen = entry.isIntersecting;
              // Catch up on the way in; settle the final state on the way out.
              if (!frame) frame = requestAnimationFrame(run);
            },
            { rootMargin: SCROLL_FRAME_MARGIN },
          )
        : null;
    if (target) observer?.observe(target);

    callback.current(true);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, watch]);
}
