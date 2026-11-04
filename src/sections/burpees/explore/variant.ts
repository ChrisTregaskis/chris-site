/**
 * Design exploration (branch explore/burpees): which prototype of the
 * Badass Burpees chapter to show, from `?burpees=a|c`. Read once at module
 * load, never during render; anything else (or no param) is the current
 * section.
 */
export type BurpeesVariant = "a" | "c";

function readVariant(): BurpeesVariant | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("burpees");
  return value === "a" || value === "c" ? value : null;
}

export const BURPEES_VARIANT = readVariant();
