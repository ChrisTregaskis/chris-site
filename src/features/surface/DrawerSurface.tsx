import { lazy, Suspense } from "react";
import { MESH_AFTER_LOAD_MS } from "./Surface";
import { useSurfaceSettings } from "./surfaceSettings";
import { useAfterLoad } from "./useAfterLoad";

const DrawerMesh = lazy(() =>
  import("./DrawerMesh").then((module) => ({ default: module.DrawerMesh })),
);

/**
 * The drawers' sheet, as the surface settings have it: plain (nothing
 * here, the drawer's own white sheet), or paper with a still pencil mesh
 * at its foot, as strong as `drawerStrength` has it.
 */
export function DrawerSurface() {
  const { drawer, drawerStrength } = useSurfaceSettings();
  // Like the page's mesh, its code waits until the page has loaded.
  const loaded = useAfterLoad(MESH_AFTER_LOAD_MS);
  return drawer === "mesh" && loaded ? (
    <Suspense fallback={null}>
      <DrawerMesh strength={drawerStrength} />
    </Suspense>
  ) : null;
}
