import { useEffect } from "react";
import { easeOutCubic, glidePlan } from "@/lib/anchorGlide";
import { topClearance } from "@/lib/topClearance";
import { DURATION } from "@/ui/tokens/motion";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Any of these from the visitor stops a glide in its tracks. */
const INTERRUPTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/** Where `target` should sit: below the sticky bar, or its own scroll-margin-top if larger. */
function targetTop(target: HTMLElement): number {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const offset = Math.max(margin, topClearance());
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  return Math.min(max, Math.max(0, top));
}

/**
 * After an anchor scroll, focus goes to what the target is named by (a
 * section's heading), else its first heading, else the target itself, so
 * keyboard and screen-reader users carry on from there.
 */
function focusTarget(target: HTMLElement): void {
  const labelId = target.getAttribute("aria-labelledby");
  const heading =
    (labelId ? document.getElementById(labelId) : null) ??
    target.querySelector<HTMLElement>("h1, h2, h3");
  const element = heading ?? target;
  if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}

let cancelGlide: (() => void) | null = null;

/**
 * Scroll to `target` and focus it. Under reduced motion it jumps. Otherwise
 * it glides; a far target is cut to within one reach first (see glidePlan),
 * so the long scroll stories between don't all play out on the way.
 */
export function scrollToAnchor(target: HTMLElement): void {
  cancelGlide?.();
  if (window.matchMedia(REDUCED_MOTION).matches) {
    window.scrollTo({ top: targetTop(target), behavior: "instant" });
    focusTarget(target);
    return;
  }
  const plan = glidePlan(
    window.scrollY,
    targetTop(target),
    window.innerHeight,
    DURATION.enter * 1000,
    DURATION.slow * 1000,
  );
  if (plan.jump !== null) {
    window.scrollTo({ top: plan.jump, behavior: "instant" });
  }
  let frame = 0;
  let began: number | null = null;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of INTERRUPTS) window.removeEventListener(type, stop);
    cancelGlide = null;
  };
  const step = (now: number) => {
    began ??= now;
    const t = plan.duration > 0 ? (now - began) / plan.duration : 1;
    // The target is re-measured each frame, in case anything above it moves.
    const end = targetTop(target);
    const top = plan.start + (end - plan.start) * easeOutCubic(t);
    window.scrollTo({ top, behavior: "instant" });
    if (t < 1) {
      frame = requestAnimationFrame(step);
    } else {
      stop();
      focusTarget(target);
    }
  };
  for (const type of INTERRUPTS) {
    window.addEventListener(type, stop, { passive: true });
  }
  cancelGlide = stop;
  frame = requestAnimationFrame(step);
}

/**
 * Every in-page link (`href="#…"`) on the page scrolls to its target rather
 * than jumping (see scrollToAnchor), and the URL takes the hash without a
 * second jump. Modified clicks (new tab and the like) are left alone.
 */
export function useAnchorScroll(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const link = event.target.closest("a");
      if (
        !link ||
        link.target ||
        link.origin !== window.location.origin ||
        link.pathname !== window.location.pathname ||
        link.search !== window.location.search ||
        !link.hash
      ) {
        return;
      }
      const target = document.getElementById(
        decodeURIComponent(link.hash.slice(1)),
      );
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      scrollToAnchor(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
