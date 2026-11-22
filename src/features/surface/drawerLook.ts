import { type MeshLook } from "./meshFacets";
import { meshLookFor } from "./meshLook";
import { type Reach } from "./reach";

/** Where the drawer's form is kept clear of the mesh: its fields, buttons, errors and alert. */
export const DRAWER_QUIET =
  'input, textarea, select, button, [role="alert"], [id$="-error"]';

/** The drawer's mesh: the page's pencil mesh, still and three quarters as strong. */
export const DRAWER_STRENGTH = 0.75;

/**
 * The drawer's mesh for a sheet `width` px wide: the page's look with its
 * pencil lines, three quarters as strong, and quiet right up to each field (nothing
 * under a field or within 6px, back over 40px), so the form stays calm.
 */
export function drawerLookFor(width: number): MeshLook {
  const look = meshLookFor(width, width / 2, true);
  return {
    ...look,
    strength: look.strength * DRAWER_STRENGTH,
    falloff: { margin: 6, width: 40, floor: 0 },
  };
}

/**
 * Where in the drawer the mesh lies: nothing over its top third, rising to
 * full at its foot, so it gathers under the form, not behind it.
 */
export function drawerReach(height: number): Reach {
  return { outFrom: -2, outTo: -1, inFrom: height * 0.3, inTo: height };
}
