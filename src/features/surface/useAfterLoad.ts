import { useEffect, useState } from "react";

/**
 * Whether the page has loaded and the browser has had `delayMs` and a quiet
 * moment since: when to bring in what can wait (the mesh's code and its
 * first drawing), so it costs the first paint nothing. As the Burpees set
 * does (useStageReady), which is what holds Lighthouse mobile at 100.
 */
export function useAfterLoad(delayMs: number): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer = 0;
    let idle = 0;
    const done = () => setReady(true);
    const later = () => {
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") {
          idle = window.requestIdleCallback(done, { timeout: 1500 });
        } else done();
      }, delayMs);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [delayMs]);

  return ready;
}
