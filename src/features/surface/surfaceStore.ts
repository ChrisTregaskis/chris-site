import {
  type SurfaceSettings,
  SURFACE_DEFAULTS,
  parseSurfaceParams,
  withSurfaceParams,
} from "./settings";

/**
 * The surface settings, app-wide. In production it's the defaults and never
 * changes. Under `pnpm dev` it starts from the URL (`?tones=1&mesh=pointer`)
 * and the dev panel changes it, writing it back to the URL so a state can be
 * shared or reloaded.
 */
let current: SurfaceSettings | null = null;
const listeners = new Set<() => void>();

function initial(): SurfaceSettings {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return parseSurfaceParams(window.location.search, SURFACE_DEFAULTS);
  }
  return SURFACE_DEFAULTS;
}

export function getSurface(): SurfaceSettings {
  current ??= initial();
  return current;
}

export function setSurface(next: SurfaceSettings): void {
  current = next;
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const { pathname, search, hash } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${withSurfaceParams(search, next)}${hash}`,
    );
  }
  for (const listener of listeners) listener();
}

export function subscribeSurface(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
