export interface FrameThrottled {
  /** Asks for a run on the next frame; repeated asks within a frame make one run. */
  (): void;
  /** Drops a pending run. */
  cancel: () => void;
}

/**
 * Wraps `run` so a burst of calls (resize events, say) runs it at most once
 * per animation frame, on the frame after the first call.
 */
export function frameThrottle(run: () => void): FrameThrottled {
  let frame = 0;
  const throttled = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      run();
    });
  };
  throttled.cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  return throttled;
}
