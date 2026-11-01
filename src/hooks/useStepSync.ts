import { useCallback, useEffect, useRef, useState } from "react";
import {
  focusBandMargin,
  scrollDeltaToFocus,
  stepAtFocus,
} from "@/lib/stepSync";

export interface StepSyncOptions {
  /** Measures the focus line (viewport px) and the highest a card may scroll to. */
  measure: () => { focusY: number; topLimit: number };
  /** Jump instead of smooth-scrolling. */
  reducedMotion: boolean;
  /** Off: no scroll tracking (e.g. a static layout); clicks still select. */
  enabled?: boolean;
}

export interface StepSync {
  /** The selected step, 1-based; 0 until anything is selected. */
  current: number;
  /** Ref for step n's scroll box (what crosses the focus line). */
  stepRef: (n: number) => (element: HTMLElement | null) => void;
  /** Ref for step n's card (what a click scrolls to the focus line). */
  cardRef: (n: number) => (element: HTMLElement | null) => void;
  /** Select step n and scroll its card to the focus line. */
  goTo: (n: number, options?: { instant?: boolean }) => void;
}

const SETTLE_MS = 140;
const SAFETY_MS = 1600;

/**
 * One source of truth for a scroll story's selected step. Scrolling selects
 * whichever step crosses a thin focus band; a click selects its step and
 * scrolls it there, ignoring the steps it passes on the way until the scroll
 * settles (scrollend, a 140ms pause, or a 1.6s safety net).
 */
export function useStepSync({
  measure,
  reducedMotion,
  enabled = true,
}: StepSyncOptions): StepSync {
  const [current, setCurrent] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const locked = useRef(false);
  const settleTimer = useRef(0);
  const safetyTimer = useRef(0);
  const measureRef = useRef(measure);

  useEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  const release = useCallback(() => {
    if (!locked.current) return;
    locked.current = false;
    window.clearTimeout(settleTimer.current);
    window.clearTimeout(safetyTimer.current);
    const { focusY } = measureRef.current();
    const n = stepAtFocus(
      steps.current.map((step) => step?.getBoundingClientRect() ?? null),
      focusY,
    );
    if (n) setCurrent(n);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let observer: IntersectionObserver | null = null;
    const observe = () => {
      observer?.disconnect();
      const { focusY } = measureRef.current();
      observer = new IntersectionObserver(
        (entries) => {
          if (locked.current) return;
          let hit: Element | null = null;
          for (const entry of entries) {
            if (entry.isIntersecting) hit = entry.target;
          }
          if (!hit) return;
          const n = steps.current.findIndex((step) => step === hit) + 1;
          if (n) setCurrent(n);
        },
        { rootMargin: focusBandMargin(focusY, window.innerHeight) },
      );
      for (const step of steps.current) {
        if (step) observer.observe(step);
      }
    };
    observe();

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(observe);
    };
    const onScroll = () => {
      if (!locked.current) return;
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(release, SETTLE_MS);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", release);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", release);
      window.clearTimeout(settleTimer.current);
      window.clearTimeout(safetyTimer.current);
    };
  }, [enabled, release]);

  const goTo = useCallback(
    (n: number, { instant = false }: { instant?: boolean } = {}) => {
      setCurrent(n);
      const card = cards.current[n - 1];
      if (!enabled || !card) return;
      const { focusY, topLimit } = measureRef.current();
      const delta = scrollDeltaToFocus(
        card.getBoundingClientRect(),
        focusY,
        window.innerHeight,
        topLimit,
      );
      if (delta === 0) return;
      locked.current = true;
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = window.setTimeout(release, SAFETY_MS);
      window.scrollTo({
        top: window.scrollY + delta,
        behavior: reducedMotion || instant ? "auto" : "smooth",
      });
    },
    [enabled, reducedMotion, release],
  );

  const stepRef = useCallback(
    (n: number) => (element: HTMLElement | null) => {
      steps.current[n - 1] = element;
    },
    [],
  );
  const cardRef = useCallback(
    (n: number) => (element: HTMLElement | null) => {
      cards.current[n - 1] = element;
    },
    [],
  );

  return { current, stepRef, cardRef, goTo };
}
