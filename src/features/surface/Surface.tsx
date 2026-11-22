import { lazy, Suspense, useLayoutEffect } from "react";
import { effectiveMesh } from "./settings";
import { useSurfaceSettings } from "./useSurfaceSettings";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import "./surface.css";

/**
 * The mesh, its own chunk: with the mesh off (the production default) none
 * of its code is fetched.
 */
const MeshCanvas = lazy(() =>
  import("./MeshCanvas").then((module) => ({ default: module.MeshCanvas })),
);

/**
 * The dev panel, only under `pnpm dev`: in a production build
 * `import.meta.env.DEV` is false, so this is null and the import (and the
 * panel's chunk) is dropped from the bundle.
 */
const SurfacePanel = import.meta.env.DEV
  ? lazy(() =>
      import("./SurfacePanel").then((module) => ({
        default: module.SurfacePanel,
      })),
    )
  : null;

/**
 * The page's surface: the chapter tones (an attribute on the root, before
 * the first paint) and the mesh behind the content, plus the dev panel
 * under `pnpm dev`. The pointer mesh is a mouse's only, and holds still
 * under reduced motion.
 */
export function Surface() {
  const settings = useSurfaceSettings();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mesh = effectiveMesh(settings.mesh, { finePointer, reducedMotion });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-tones", settings.tones);
    return () => root.removeAttribute("data-tones");
  }, [settings.tones]);

  const fallback =
    mesh === settings.mesh
      ? null
      : reducedMotion
        ? "Pointer holds still here: reduced motion is on."
        : "Pointer holds still here: no mouse.";

  return (
    <>
      {mesh === "off" ? null : (
        <Suspense fallback={null}>
          <MeshCanvas pointer={mesh === "pointer"} lines={settings.lines} />
        </Suspense>
      )}
      {SurfacePanel ? (
        <Suspense fallback={null}>
          <SurfacePanel fallback={fallback} />
        </Suspense>
      ) : null}
    </>
  );
}
