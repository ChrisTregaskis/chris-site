/**
 * The page's surface: experiments on the paper behind the content, each
 * switched on its own (see Surface, under Design system in CLAUDE.md).
 *
 * - `tones`: each chapter on its own shade of the drafting paper, faded in
 *   from the one before (the `--color-paper-*` tokens).
 * - `mesh`: a surveyor's triangulation in the paper's surface, `static`, or
 *   `pointer` (its facets press in under the mouse). `pointer` falls back to
 *   `static` under reduced motion and on touch screens.
 * - `lines`: the mesh's own edges, as a faint pencil net over its facets.
 * - `reach`: where the mesh lies: `ends` (the hero, and About through
 *   Contact, fading out into the work and back in after it) or the whole
 *   `page` (stepping back round the drawings).
 * - `strength`: how strongly the mesh is drawn in open paper (see
 *   strength.ts); `protect`: whether it steps back behind text, which is
 *   what lets it be stronger than Subtle and keep text at AA.
 * - `drawer`: the enquiry and CV drawers' sheet, `plain` or with a still
 *   pencil `mesh` gathered at its foot; `drawerStrength`: how strongly.
 */
import { type DrawerLevel, type LineLevel } from "./strength";

export const MESH_MODES = ["off", "static", "pointer"] as const;
export type MeshMode = (typeof MESH_MODES)[number];

export type MeshReach = "ends" | "page";
export type DrawerSheet = "plain" | "mesh";

// A type, not an interface, so it fits the dev panel's DevValues.
export type SurfaceSettings = {
  tones: boolean;
  mesh: MeshMode;
  lines: boolean;
  reach: MeshReach;
  strength: LineLevel;
  protect: boolean;
  drawer: DrawerSheet;
  drawerStrength: DrawerLevel;
};

/**
 * What the production build uses: chapter tones on; the pencil mesh with
 * the pointer at the two ends of the page, at Medium, stepping back behind
 * text; the drawers on paper with a still mesh, Faint at their foot. The
 * dev panel and the URL parameters only exist under `pnpm dev`.
 */
export const SURFACE_DEFAULTS: SurfaceSettings = {
  tones: true,
  mesh: "pointer",
  lines: true,
  reach: "ends",
  strength: "medium",
  protect: true,
  drawer: "mesh",
  drawerStrength: "faint",
};

/** The mesh the visitor gets: `pointer` only with a fine, hovering pointer and motion allowed. */
export function effectiveMesh(
  mesh: MeshMode,
  {
    finePointer,
    reducedMotion,
  }: { finePointer: boolean; reducedMotion: boolean },
): MeshMode {
  if (mesh === "pointer" && (!finePointer || reducedMotion)) return "static";
  return mesh;
}
