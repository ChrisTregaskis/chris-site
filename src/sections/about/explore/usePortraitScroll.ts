import { type RefObject, useCallback, useRef } from "react";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { viewportProgress } from "@/lib/scrollProgress";

/**
 * Calls `onProgress` with how far `ref` is through the viewport (0 as its top
 * comes up from the bottom, 1 as its bottom leaves the top), to a thousandth,
 * and only when that changes. Off when `enabled` is false (reduced motion).
 */
export function usePortraitScroll(
  ref: RefObject<HTMLElement | null>,
  onProgress: (t: number) => void,
  enabled: boolean,
): void {
  const drawn = useRef(-1);
  const onFrame = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t =
      Math.round(
        viewportProgress(rect.top, rect.height, window.innerHeight) * 1000,
      ) / 1000;
    if (t === drawn.current) return;
    drawn.current = t;
    onProgress(t);
  }, [ref, onProgress]);
  useScrollFrame(onFrame, enabled, ref);
}
