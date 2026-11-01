import { useEffect, useRef, useState } from "react";
import { SEAL, SEAL_BEAT_MS, STILL_FRAME } from "./burpeeSet";

/**
 * Plays the Navy SEAL rep on a loop at the app's beat while the figure is at
 * least 30% on screen, standing still otherwise. Under reduced motion it
 * holds one frame.
 */
export function useSealBeat(still: boolean) {
  const figureRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(-1);

  useEffect(() => {
    const figure = figureRef.current;
    if (still || !figure) return undefined;
    let timer = 0;
    let next = 0;
    const play = () => {
      setBeat(next);
      next = (next + 1) % SEAL.length;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        window.clearInterval(timer);
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          timer = window.setInterval(play, SEAL_BEAT_MS);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(figure);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [still]);

  const frame = still
    ? STILL_FRAME
    : beat < 0
      ? (["stand", null] as const)
      : SEAL[beat];
  return { figureRef, pose: frame[0], count: frame[1] };
}
