/**
 * Design exploration (branch explore/physio-arch): the physio chapter's next
 * draft, the rings explorer, from `?physio=next`. Read once at module load,
 * never during render; anything else (or no param) is the live chapter,
 * untouched, so the two can be compared.
 */
export function parsePhysioNext(search: string): boolean {
  return new URLSearchParams(search).get("physio") === "next";
}

function readPhysioNext(): boolean {
  if (typeof window === "undefined") return false;
  return parsePhysioNext(window.location.search);
}

export const PHYSIO_NEXT = readPhysioNext();
