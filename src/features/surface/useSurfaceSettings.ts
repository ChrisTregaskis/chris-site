import { useSyncExternalStore } from "react";
import { type SurfaceSettings } from "./settings";
import { getSurface, subscribeSurface } from "./surfaceStore";

/** The surface settings, live (see surfaceStore). */
export function useSurfaceSettings(): SurfaceSettings {
  return useSyncExternalStore(subscribeSurface, getSurface, getSurface);
}
