import { type RefObject, useLayoutEffect } from "react";

/**
 * Keeps the set's count inside its column whatever the font renders: it
 * measures a ghost of the widest count ("100") set at 100px in the same
 * type, and writes the size that fits the column as `--fit` on the count
 * (which caps its own size by the screen's height too). Measured on
 * resize and once the fonts have loaded, since glyph widths differ across
 * browsers and before the display face arrives.
 */
export function useFitNumeral(
  column: RefObject<HTMLElement>,
  ghost: RefObject<HTMLElement>,
  target: RefObject<HTMLElement>,
) {
  useLayoutEffect(() => {
    const col = column.current;
    const probe = ghost.current;
    const count = target.current;
    if (!col || !probe || !count) return undefined;
    const fit = () => {
      const width = probe.getBoundingClientRect().width;
      if (!width) return;
      const size = Math.floor(((col.clientWidth * 0.96) / width) * 100);
      count.style.setProperty("--fit", `${size}px`);
    };
    fit();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(col);
    let live = true;
    // jsdom (the tests) has no FontFaceSet.
    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        if (live) fit();
      });
    }
    return () => {
      live = false;
      observer?.disconnect();
    };
  }, [column, ghost, target]);
}
