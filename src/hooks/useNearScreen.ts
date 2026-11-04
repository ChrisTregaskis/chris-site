import { type RefObject, useEffect, useState } from "react";

/**
 * Whether `ref` has come within about a screen and a half of the viewport,
 * latched once it has. Lets a chapter draw a figure only as the visitor
 * nears it, so the first paint doesn't pay for something far below the fold.
 * `always` skips the wait (the static, reduced-motion page).
 */
export function useNearScreen(
  ref: RefObject<HTMLElement>,
  always: boolean,
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (always || near || !element) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, always, near]);

  return always || near;
}
