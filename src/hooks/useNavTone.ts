import { type RefObject, useCallback } from "react";
import { useScrollFrame } from "./useScrollFrame";
import { featherPx, parseRgb, toneAt } from "@/lib/navTone";

/**
 * Keeps the solid top bar the same colour as the page right under it. Each
 * chapter sits on its own tone (the .chapter-tone plate, fading in from the
 * one before), so a bar in plain surface would show as a darker band over
 * them. Every scroll frame this finds the chapter under the bar's bottom
 * edge and paints the bar the plate's colour at that point; outside the
 * chapters it clears the inline colour, back to surface.
 */
export function useNavTone(bar: RefObject<HTMLElement | null>): void {
  const paint = useCallback(() => {
    const el = bar.current;
    if (!el) return;
    const y = el.getBoundingClientRect().bottom;
    for (const section of document.querySelectorAll<HTMLElement>(
      ".chapter-tone",
    )) {
      const rect = section.getBoundingClientRect();
      if (rect.top > y || rect.bottom <= y) continue;
      const style = getComputedStyle(section);
      const from = parseRgb(style.getPropertyValue("--tone-from"));
      const to = parseRgb(style.getPropertyValue("--tone-to"));
      if (!from || !to) break;
      const feather = featherPx(
        style.getPropertyValue("--tone-feather"),
        rect.height,
        window.innerHeight,
      );
      const [r, g, b] = toneAt(from, to, feather, y - rect.top);
      el.style.backgroundColor = `rgb(${r} ${g} ${b})`;
      return;
    }
    el.style.backgroundColor = "";
  }, [bar]);

  useScrollFrame(paint);
}
