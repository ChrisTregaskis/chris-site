import { type RefObject, useEffect } from "react";
import { useNearScreen } from "@/hooks/useNearScreen";

/** How long after the page's load event the stage's code is fetched: well after its first paint. */
const PREFETCH_AFTER_MS = 1000;

/**
 * When to draw the set: once its room comes within about a screen and a
 * half (at once when `always`, the static, reduced-motion page). Its code
 * is fetched ahead of that, a moment after the page has loaded and when the
 * browser is quiet, so it's there before the visitor is, without costing
 * the first paint anything.
 */
export function useStageReady(
  room: RefObject<HTMLElement>,
  load: () => Promise<unknown>,
  always: boolean,
): boolean {
  const near = useNearScreen(room, always);

  useEffect(() => {
    let timer = 0;
    let idle = 0;
    const prefetch = () => {
      load().catch(() => undefined);
    };
    const later = () => {
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") {
          idle = window.requestIdleCallback(prefetch, { timeout: 2000 });
        } else prefetch();
      }, PREFETCH_AFTER_MS);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      window.removeEventListener("load", later);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [load]);

  return near;
}
