/**
 * The page's surface: two experiments on the paper behind the content, each
 * switched on its own (see LOOK.md, Background experiments).
 *
 * - `tones`: each chapter on its own shade of the drafting paper, faded in
 *   from the one before (the `--color-paper-*` tokens).
 * - `mesh`: a surveyor's triangulation in the paper's surface, `static`, or
 *   `pointer` (its facets press in under the mouse). `pointer` falls back to
 *   `static` under reduced motion and on touch screens.
 * - `lines`: the mesh's own edges, as a faint pencil net over its facets.
 */
export const MESH_MODES = ["off", "static", "pointer"] as const;
export type MeshMode = (typeof MESH_MODES)[number];

export interface SurfaceSettings {
  tones: boolean;
  mesh: MeshMode;
  lines: boolean;
}

/**
 * What the production build uses: chapter tones on, the mesh off. The dev
 * panel and the URL parameters only exist under `pnpm dev`, so this is the
 * whole of the surface's behaviour once built.
 */
export const SURFACE_DEFAULTS: SurfaceSettings = {
  tones: true,
  mesh: "off",
  lines: false,
};

function isMeshMode(value: string | null): value is MeshMode {
  return (MESH_MODES as readonly string[]).includes(value ?? "");
}

/** A flag parameter: 1 or on, 0 or off, anything else the fallback. */
function flag(value: string | null, fallback: boolean): boolean {
  if (value === "1" || value === "on") return true;
  if (value === "0" || value === "off") return false;
  return fallback;
}

/**
 * Settings from a query string (`?tones=1&mesh=pointer&lines=0`), any
 * parameter missing or unreadable keeping its `fallback`.
 */
export function parseSurfaceParams(
  search: string,
  fallback: SurfaceSettings,
): SurfaceSettings {
  const params = new URLSearchParams(search);
  const mesh = params.get("mesh");
  return {
    tones: flag(params.get("tones"), fallback.tones),
    mesh: isMeshMode(mesh) ? mesh : fallback.mesh,
    lines: flag(params.get("lines"), fallback.lines),
  };
}

/** `search` with the settings written into it, other parameters kept. */
export function withSurfaceParams(
  search: string,
  settings: SurfaceSettings,
): string {
  const params = new URLSearchParams(search);
  params.set("tones", settings.tones ? "1" : "0");
  params.set("mesh", settings.mesh);
  params.set("lines", settings.lines ? "1" : "0");
  const query = params.toString();
  return query ? `?${query}` : "";
}

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
