import { type RefObject, useEffect, useState } from "react";

/**
 * Steps an index through `length` positions, holding each for
 * `holdFor(index)` ms and looping, while `watch` is at least 30% on screen
 * and `running`. Restarts from the first position whenever `length` or
 * `restartKey` changes. Off (or under reduced motion), it stays on -1.
 */
export function usePlayhead(
  length: number,
  holdFor: (index: number) => number,
  running: boolean,
  watch: RefObject<Element | null>,
  restartKey: string = "",
): number {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const target = watch.current;
    if (!running || !target) {
      setIndex(-1);
      return undefined;
    }
    let timer = 0;
    let current = -1;
    const advance = () => {
      current = (current + 1) % length;
      setIndex(current);
      timer = window.setTimeout(advance, holdFor(current));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        window.clearTimeout(timer);
        if (entries.some((entry) => entry.isIntersecting)) advance();
      },
      { threshold: 0.3 },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
    // holdFor is read fresh each beat through the closure it was given;
    // restarting on it would reset the loop every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, running, watch, restartKey]);

  return index;
}
