import { type RefObject, useCallback } from "react";
import { useScrollFrame } from "./useScrollFrame";
import { featherPx, isStuck, parseRgb, toneAt } from "@/lib/navTone";

/**
 * Keeps the solid top bar (`.top-bar`) the same colour as the page right
 * under it. Each chapter sits on its own tone (the .chapter-tone plate,
 * fading in from the one before), so a bar in plain surface would show as a
 * darker band over them. Every scroll frame this finds the chapter under the
 * bar's bottom edge and sets `--bar-tone` to the plate's colour at that
 * point (cleared outside the chapters, back to surface).
 *
 * It also marks the bar `data-flush` while a stage pinned flush under it
 * (`[data-bar-flush]`, the Wayfinder figure) is stuck there, which drops the
 * bar's fade: that stage has its own backing, and the fade would veil it.
 */
export function useNavTone(bar: RefObject<HTMLElement | null>): void {
  const paint = useCallback(() => {
    const el = bar.current;
    if (!el) return;
    const y = el.getBoundingClientRect().bottom;

    const flush = [
      ...document.querySelectorAll<HTMLElement>("[data-bar-flush]"),
    ].some((stage) =>
      isStuck(
        stage.getBoundingClientRect().top,
        parseFloat(getComputedStyle(stage).top),
      ),
    );
    el.toggleAttribute("data-flush", flush);

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
      el.style.setProperty(
        "--bar-tone",
        toneAt(from, to, feather, y - rect.top).join(" "),
      );
      return;
    }
    el.style.removeProperty("--bar-tone");
  }, [bar]);

  useScrollFrame(paint);
}
