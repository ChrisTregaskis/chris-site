import {
  type SurfaceSettings,
  SURFACE_DEFAULTS,
  effectiveMesh,
} from "./settings";
import { defineDevSettings, useDevSettings } from "@/features/dev-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Under `pnpm dev`, says when the pointer mesh is holding still. */
function useSurfaceNote(values: SurfaceSettings): string | null {
  const finePointer = useMediaQuery(FINE_POINTER);
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  if (
    effectiveMesh(values.mesh, { finePointer, reducedMotion }) === values.mesh
  ) {
    return null;
  }
  return reducedMotion
    ? "Pointer holds still here: reduced motion is on."
    : "Pointer holds still here: no mouse.";
}

/**
 * The surface settings: SURFACE_DEFAULTS in production; under `pnpm dev`,
 * the dev panel's Surface group and `?tones=1&mesh=pointer&lines=1&reach=ends&drawer=plain`.
 */
export const surfaceSettings = defineDevSettings<SurfaceSettings>(
  SURFACE_DEFAULTS,
  import.meta.env.DEV
    ? {
        title: "Surface",
        controls: [
          { kind: "flag", key: "tones", label: "Chapter tones" },
          {
            kind: "choice",
            key: "mesh",
            label: "Mesh",
            options: [
              { value: "off", label: "Off" },
              { value: "static", label: "Static" },
              { value: "pointer", label: "Pointer" },
            ],
          },
          { kind: "flag", key: "lines", label: "Pencil lines" },
          {
            kind: "choice",
            key: "reach",
            label: "Mesh reach",
            options: [
              { value: "ends", label: "Hero and About to Contact" },
              { value: "page", label: "Whole page" },
            ],
          },
          {
            kind: "choice",
            key: "drawer",
            label: "Drawer sheet",
            options: [
              { value: "plain", label: "Plain" },
              { value: "mesh", label: "Pencil mesh" },
            ],
          },
        ],
        inactive: (key, values) =>
          (key === "lines" || key === "reach") && values.mesh === "off",
        useNote: useSurfaceNote,
      }
    : null,
);

/** The surface settings, live. */
export function useSurfaceSettings(): SurfaceSettings {
  return useDevSettings(surfaceSettings);
}
