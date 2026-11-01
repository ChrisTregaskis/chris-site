import { useEffect, useRef } from "react";

/**
 * Calls `onFrame` once now, then at most once per animation frame while the
 * page scrolls or resizes. For scroll-driven visuals that write straight to
 * the DOM or set coarse state; off when `enabled` is false.
 */
export function useScrollFrame(onFrame: () => void, enabled = true): void {
  const callback = useRef(onFrame);

  useEffect(() => {
    callback.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        callback.current();
      });
    };
    callback.current();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);
}
