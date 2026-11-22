import { lazy, Suspense } from "react";
import { useSurfaceSettings } from "./surfaceSettings";

const DrawerMesh = lazy(() =>
  import("./DrawerMesh").then((module) => ({ default: module.DrawerMesh })),
);

/**
 * The drawers' sheet, as the surface settings have it: plain (nothing
 * here, the drawer's own white sheet), or paper with a faint pencil mesh.
 */
export function DrawerSurface() {
  const { drawer } = useSurfaceSettings();
  return drawer === "mesh" ? (
    <Suspense fallback={null}>
      <DrawerMesh />
    </Suspense>
  ) : null;
}
