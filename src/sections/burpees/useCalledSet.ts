import { type RefObject, useCallback, useRef, useState } from "react";
import { callAt, CALLS, repsAt, SET_REPS } from "./calls";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { stickyProgress } from "@/lib/scrollProgress";

/**
 * The set as the visitor scrolls through its run: reps done and the call
 * last made, from how far the pinned stage has travelled. Coarse state, so
 * a frame that changes neither re-renders nothing. Still (reduced motion):
 * the finished set. With `progressVar` (the scroll-feel prototype c), it also
 * writes the run's 0 to 1 progress to the stage as `--set-p`, to the
 * thousandth, for the count's strain.
 */
export function useCalledSet(
  still: boolean,
  run: RefObject<HTMLElement>,
  stage: RefObject<HTMLElement>,
  progressVar = false,
) {
  const [reps, setReps] = useState(0);
  const [called, setCalled] = useState(0);
  const stickTop = useRef(0);
  const written = useRef(-1);

  const onFrame = useCallback(
    (resized: boolean) => {
      const runway = run.current;
      const pinned = stage.current;
      if (!runway || !pinned) return;
      if (resized) {
        stickTop.current = parseFloat(getComputedStyle(pinned).top) || 0;
      }
      const rect = runway.getBoundingClientRect();
      const progress = stickyProgress(
        rect.top,
        rect.height,
        window.innerHeight,
        stickTop.current,
      );
      setReps(repsAt(progress));
      setCalled(callAt(progress));
      if (progressVar) {
        const rounded = Math.round(progress * 1000) / 1000;
        if (rounded !== written.current) {
          written.current = rounded;
          pinned.style.setProperty("--set-p", String(rounded));
        }
      }
    },
    [run, stage, progressVar],
  );
  useScrollFrame(onFrame, !still, run);

  return still
    ? { reps: SET_REPS, called: CALLS.length - 1 }
    : { reps, called };
}
