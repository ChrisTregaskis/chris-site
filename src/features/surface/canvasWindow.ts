/**
 * The mesh's canvas is a window onto the page, not the whole page: a band a
 * little taller than the screen, anchored to the page (so the compositor
 * scrolls it with the content, frame for frame, with no lag), moved along
 * in steps as the reader scrolls on. The steps are half the overscan, so
 * there's always at least three quarters of it above and below the screen.
 */

/** Extra canvas above and below the screen, as a share of its height. */
export const OVERSCAN = 0.3;

/** The device pixel ratio's ceiling: the facets are soft tone, not line. */
export const MAX_PIXEL_RATIO = 1.5;

/** The canvas's ceiling in device pixels (about 4 megapixels). */
export const MAX_CANVAS_PIXELS = 4_000_000;

export interface CanvasWindow {
  /** The band's top on the page, in px. */
  top: number;
  /** Its height, in px. */
  height: number;
}

/** The band of the page the canvas covers for a reader scrolled to `scrollY`. */
export function canvasWindow(
  scrollY: number,
  viewHeight: number,
  pageHeight: number,
  overscan = OVERSCAN,
): CanvasWindow {
  const margin = Math.round(viewHeight * overscan);
  const height = Math.min(pageHeight, viewHeight + 2 * margin);
  const step = Math.max(1, Math.round(margin / 2));
  const wanted = Math.round((scrollY - margin) / step) * step;
  const top = Math.min(Math.max(0, wanted), Math.max(0, pageHeight - height));
  return { top, height };
}

/** The pixel ratio to draw at: the device's, capped, and lower still for a huge canvas. */
export function canvasPixelRatio(
  devicePixelRatio: number,
  width: number,
  height: number,
): number {
  const area = Math.max(1, width * height);
  return Math.max(
    0.5,
    Math.min(
      devicePixelRatio || 1,
      MAX_PIXEL_RATIO,
      Math.sqrt(MAX_CANVAS_PIXELS / area),
    ),
  );
}
