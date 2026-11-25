import { type SurfaceSettings, SURFACE_DEFAULTS } from "./settings";
import { defineDevSettings, useDevSettings } from "@/features/dev-panel";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * The surface settings: SURFACE_DEFAULTS, settled on 22 Nov 2026 and no
 * longer in the dev panel. Still a settings store, so tests can switch the
 * layers on and off with `surfaceSettings.set`; to experiment again, give it
 * a dev panel group (see the phone stage's settings for the pattern).
 */
export const surfaceSettings = defineDevSettings<SurfaceSettings>(
  SURFACE_DEFAULTS,
  null,
);

/** The surface settings, live. */
export function useSurfaceSettings(): SurfaceSettings {
  return useDevSettings(surfaceSettings);
}
