/** An sRGB colour as three 0–255 channels. */
export type Rgb = readonly [number, number, number];

/** A tone token's value ("25 27 66", as tokens.css writes them) as channels. */
export function parseRgb(value: string): Rgb | null {
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return [parts[0], parts[1], parts[2]];
}

/**
 * A chapter's `--tone-feather` in px. It may be px, vh, or a percentage of
 * the chapter's own height (the gradient runs down the chapter's plate);
 * anything else falls back to the 360px default.
 */
export function featherPx(
  raw: string,
  sectionHeight: number,
  viewportHeight: number,
): number {
  const value = raw.trim();
  const n = parseFloat(value);
  if (!value || !Number.isFinite(n)) return 360;
  if (value.endsWith("%")) return (n / 100) * sectionHeight;
  if (value.endsWith("vh")) return (n / 100) * viewportHeight;
  if (value.endsWith("px")) return n;
  return 360;
}

/**
 * The colour of a chapter's plate `offset` px below its top: `from` easing
 * linearly to `to` over `feather` px, then `to` (the .chapter-tone gradient).
 */
export function toneAt(
  from: Rgb,
  to: Rgb,
  feather: number,
  offset: number,
): Rgb {
  const t = feather <= 0 ? 1 : Math.min(1, Math.max(0, offset / feather));
  return [0, 1, 2].map((i) =>
    Math.round(from[i] + (to[i] - from[i]) * t),
  ) as unknown as Rgb;
}

/**
 * Whether a sticky element is stuck at its `top` offset right now (its box
 * sits there to within half a pixel), rather than still on its way up or
 * already pushed off by the end of its container. A `top` of `auto` (NaN)
 * means it isn't sticky at this width.
 */
export function isStuck(rectTop: number, stickyTop: number): boolean {
  return Number.isFinite(stickyTop) && Math.abs(rectTop - stickyTop) < 0.5;
}
