import { useEffect, useRef, useState } from "react";
import { odometerNext, odometerTickMs } from "./odometerTicks";

export interface OdometerState {
  /** The number on show. */
  shown: number;
  /** 1 counting up, -1 counting down: which way the digits roll. */
  direction: 1 | -1;
  /** How long the current tick's roll lasts. */
  tickMs: number;
}

/**
 * Rolls `shown` towards `target` one tick at a time. A new target mid-roll is
 * picked up by the running roll (it can reverse). Under reduced motion it
 * jumps straight there.
 */
export function useOdometer(
  target: number,
  reducedMotion: boolean,
): OdometerState {
  const [state, setState] = useState<OdometerState>({
    shown: target,
    direction: 1,
    tickMs: 0,
  });
  const tickStartedAt = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setState((previous) =>
        previous.shown === target
          ? previous
          : { ...previous, shown: target, tickMs: 0 },
      );
      return undefined;
    }
    if (state.shown === target) return undefined;

    const step = () => {
      tickStartedAt.current = Date.now();
      setState((previous) => {
        const next = odometerNext(previous.shown, target);
        return {
          shown: next,
          direction: next > previous.shown ? 1 : -1,
          tickMs: odometerTickMs(Math.abs(target - previous.shown)),
        };
      });
    };

    // The first tick starts at once; later ones wait for the roll in progress.
    const elapsed = Date.now() - tickStartedAt.current;
    const wait = Math.max(0, state.tickMs - elapsed);
    if (state.tickMs === 0 || wait === 0) {
      step();
      return undefined;
    }
    const timer = window.setTimeout(step, wait);
    return () => window.clearTimeout(timer);
  }, [target, reducedMotion, state.shown, state.tickMs]);

  return state;
}
