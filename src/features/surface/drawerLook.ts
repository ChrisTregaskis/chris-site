import { type MeshLook } from "./meshFacets";
import { meshLookFor } from "./meshLook";
import { type Reach } from "./reach";

/** Where the drawer's form is kept clear of the mesh: its fields, buttons, errors and alert. */
export const DRAWER_QUIET =
  'input, textarea, select, button, [role="alert"], [id$="-error"]';

/**
 * The drawer's mesh for a sheet `width` px wide at `level` (see
 * DRAWER_LEVELS): the page's look with its pencil lines, and quiet right
 * up to each field (no facet under a field or within 6px, back over 40px),
 * so the form stays calm.
 */
export function drawerLookFor(width: number, level: number): MeshLook {
  return {
    ...meshLookFor(width, width / 2, true, level),
    falloff: { margin: 6, width: 40, floor: 0 },
  };
}

/**
 * Where in the drawer the mesh lies: in the empty paper under the form.
 * Full from just below the form's last field, button or line of text
 * (`contentBottom`) to the drawer's foot, fading out going up over a third
 * of the drawer (at least 240px), so it's strongest in the dead space and
 * gone by the time it reaches the form. On a phone, where the form fills
 * the sheet, that leaves it in the bottom padding and faint between the
 * last fields.
 */
export function drawerReach(height: number, contentBottom: number): Reach {
  const full = Math.min(height, contentBottom + 16);
  const fade = Math.max(240, height / 3);
  return { outFrom: -2, outTo: -1, inFrom: full - fade, inTo: full };
}
