/**
 * How much of the viewport's top the sticky top bar covers, in px. Read from
 * the root's `scroll-padding-top` (set to the bar's height in global styles),
 * so scroll stories keep what they pin or scroll to out from under the bar.
 */
export function topClearance(): number {
  return (
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  );
}
