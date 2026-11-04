import { type View } from "./pacing";

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * Puts a ribbon at a view and zoom level, straight to the DOM (once per
 * frame while scrolling): the bar's SVG takes the view as its viewBox, each
 * `data-t` element moves to its time (and, with `data-d`, takes its
 * duration as its width), and each `data-show` element fades in around its
 * own level.
 */
export function applyView(root: HTMLElement, view: View, level: number) {
  const width = root.clientWidth;
  const svg = root.querySelector("svg");
  svg?.setAttribute("viewBox", `${view.start} 0 ${view.span} 1`);
  const px = width / view.span;
  for (const el of root.querySelectorAll<HTMLElement>("[data-t]")) {
    const x = (Number(el.dataset.t) - view.start) * px;
    el.style.transform = `translateX(${x}px)`;
    if (el.dataset.d) el.style.width = `${Number(el.dataset.d) * px}px`;
  }
  for (const el of root.querySelectorAll<HTMLElement>("[data-show]")) {
    const shown = clamp01(1 - Math.abs(level - Number(el.dataset.show)) * 2.5);
    el.style.opacity = String(shown);
    el.style.visibility = shown < 0.02 ? "hidden" : "visible";
  }
}
