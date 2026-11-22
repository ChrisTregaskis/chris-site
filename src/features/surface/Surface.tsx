import { lazy, Suspense, useLayoutEffect } from "react";
import { effectiveMesh } from "./settings";
import {
  FINE_POINTER,
  REDUCED_MOTION,
  useSurfaceSettings,
} from "./surfaceSettings";
import { useAfterLoad } from "./useAfterLoad";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import "./surface.css";

/** How long after the page's load event the mesh arrives. */
export const MESH_AFTER_LOAD_MS = 400;

/**
 * The mesh, its own chunk, fetched once the page has loaded: with the mesh
 * off, none of its code is fetched at all.
 */
const MeshCanvas = lazy(() =>
  import("./MeshCanvas").then((module) => ({ default: module.MeshCanvas })),
);

/**
 * The page's surface: the chapter tones (an attribute on the root, before
 * the first paint) and the mesh behind the content. The pointer mesh is a
 * mouse's only, and holds still under reduced motion.
 */
export function Surface() {
  const settings = useSurfaceSettings();
  const finePointer = useMediaQuery(FINE_POINTER);
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const mesh = effectiveMesh(settings.mesh, { finePointer, reducedMotion });
  const loaded = useAfterLoad(MESH_AFTER_LOAD_MS);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-tones", settings.tones);
    return () => root.removeAttribute("data-tones");
  }, [settings.tones]);

  return mesh === "off" || !loaded ? null : (
    <Suspense fallback={null}>
      <MeshCanvas
        pointer={mesh === "pointer"}
        lines={settings.lines}
        reach={settings.reach}
        strength={settings.strength}
        protect={settings.protect}
      />
    </Suspense>
  );
}
