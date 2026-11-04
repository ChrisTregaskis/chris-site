/**
 * Design exploration (explore/seamless, throwaway): `?look=d` sets
 * `data-look` on <html>, which scopes the variant styles in looks.css. With
 * no param the page is the baseline.
 */
export const LOOKS = ["d"] as const;
export type Look = (typeof LOOKS)[number];

export const LOOK_NAMES: Record<Look, string> = {
  d: "Night chapters",
};

export function readLook(search: string): Look | null {
  const value = new URLSearchParams(search).get("look");
  return LOOKS.find((look) => look === value) ?? null;
}

export function applyLook(): void {
  const look = readLook(window.location.search);
  if (look) document.documentElement.dataset.look = look;
}
