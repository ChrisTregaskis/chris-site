/**
 * Design exploration (branch explore/physio): which prototype of the physio
 * chapter to show, from `?physio=b|c`. Read once at module load, never
 * during render; anything else (or no param) is the current section.
 */
export type PhysioVariant = "b" | "c";

function readVariant(): PhysioVariant | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("physio");
  return value === "b" || value === "c" ? value : null;
}

export const PHYSIO_VARIANT = readVariant();
