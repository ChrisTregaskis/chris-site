import { useCallback, useEffect, useRef, useState } from "react";
import {
  type FocusAlign,
  focusBandMargin,
  scrollDeltaToFocus,
  stepAtFocus,
  type StepTrack,
} from "@/lib/stepSync";

export interface StepSyncOptions {
  /**
   * Measures the focus line (viewport px), the highest a card may scroll to,
   * and what has to cross the line to be selected: the step's scroll box
   * (the default) or just its card.
   */
  measure: () => { focusY: number; topLimit: number; track?: StepTrack };
  /** Jump instead of smooth-scrolling. */
  reducedMotion: boolean;
  /** Off: no scroll tracking (e.g. a static layout); clicks still select. */
  enabled?: boolean;
}

export interface StepSync {
  /** The selected step, 1-based; 0 until anything is selected. */
  current: number;
  /** Ref for step n's scroll box (what crosses the focus line, by default). */
  stepRef: (n: number) => (element: HTMLElement | null) => void;
  /** Ref for step n's card (what a click scrolls to the focus line, and what crosses it when tracking cards). */
  cardRef: (n: number) => (element: HTMLElement | null) => void;
  /** Select step n and scroll its card to the focus line (or, `align: "end"`, a tall card's bottom into view). */
  goTo: (n: number, options?: GoToOptions) => void;
}

export interface GoToOptions {
  instant?: boolean;
  align?: FocusAlign;
}

const SETTLE_MS = 140;
const SAFETY_MS = 1600;

/**
 * One source of truth for a scroll story's selected step. Scrolling selects
 * whichever step (or card, when `measure` says so) crosses a thin focus band;
 * a click selects its step and
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
  /** What the observer watches: the step boxes or the cards. */
  const tracked = useRef(steps.current);

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
      tracked.current.map((target) => target?.getBoundingClientRect() ?? null),
      focusY,
    );
    if (n) setCurrent(n);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let observer: IntersectionObserver | null = null;
    const observe = () => {
      observer?.disconnect();
      const { focusY, track = "step" } = measureRef.current();
      tracked.current = track === "card" ? cards.current : steps.current;
      observer = new IntersectionObserver(
        (entries) => {
          if (locked.current) return;
          let hit: Element | null = null;
          for (const entry of entries) {
            if (entry.isIntersecting) hit = entry.target;
          }
          if (!hit) return;
          const n = tracked.current.findIndex((target) => target === hit) + 1;
          if (n) setCurrent(n);
        },
        { rootMargin: focusBandMargin(focusY, window.innerHeight) },
      );
      for (const target of tracked.current) {
        if (target) observer.observe(target);
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
    (n: number, { instant = false, align = "focus" }: GoToOptions = {}) => {
      setCurrent(n);
      const card = cards.current[n - 1];
      if (!enabled || !card) return;
      const { focusY, topLimit } = measureRef.current();
      const delta = scrollDeltaToFocus(
        card.getBoundingClientRect(),
        focusY,
        window.innerHeight,
        topLimit,
        align,
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
