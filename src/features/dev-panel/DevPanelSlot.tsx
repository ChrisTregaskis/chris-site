import { lazy, Suspense } from "react";

/**
 * The dev panel, only under `pnpm dev`: in a production build
 * `import.meta.env.DEV` is false, so this is null and the panel's import
 * (and its chunk) is dropped from the bundle.
 */
const DevPanel = import.meta.env.DEV
  ? lazy(() =>
      import("./DevPanel").then((module) => ({ default: module.DevPanel })),
    )
  : null;

/** Where the app mounts the dev panel: nothing at all in production. */
export function DevPanelSlot() {
  return DevPanel ? (
    <Suspense fallback={null}>
      <DevPanel />
    </Suspense>
  ) : null;
}
