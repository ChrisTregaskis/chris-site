/**
 * Design exploration (branch explore/physio-arch): a "how it runs" layer for
 * the physio chapter, in one of three drawings, from `?physioarch=a|b|c`.
 * Each drawing has the place it suits best (before the row-level security
 * steps, or after the leak test); `&place=before|after` overrides it for a
 * side-by-side read. Read once at module load, never during render; no
 * param (or anything else) is the live chapter, untouched.
 */
export type ArchDirection = "a" | "b" | "c";
export type ArchPlace = "before" | "after";

export interface ArchDraft {
  direction: ArchDirection;
  place: ArchPlace;
}

/** Where each drawing reads best. */
export const DEFAULT_PLACE: Record<ArchDirection, ArchPlace> = {
  // A route that ends at Postgres, where the steps pick up.
  a: "before",
  // Under the floor the leak test stood on.
  b: "after",
  // From the outside in, to the centre the steps then open up.
  c: "before",
};

const DIRECTIONS: readonly ArchDirection[] = ["a", "b", "c"];
const PLACES: readonly ArchPlace[] = ["before", "after"];

export function parseArchDraft(search: string): ArchDraft | null {
  const params = new URLSearchParams(search);
  const direction = DIRECTIONS.find((d) => d === params.get("physioarch"));
  if (!direction) return null;
  const place =
    PLACES.find((p) => p === params.get("place")) ?? DEFAULT_PLACE[direction];
  return { direction, place };
}

function readArchDraft(): ArchDraft | null {
  if (typeof window === "undefined") return null;
  return parseArchDraft(window.location.search);
}

export const ARCH_DRAFT = readArchDraft();
