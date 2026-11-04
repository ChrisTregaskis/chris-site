import { MOST_ROWS, ORG_ROWS } from "../organisations";

/*
 * Exploration: the measures the three phone drawings share, in scene px.
 * Each draws one 3D scene in a box `SCENE_H` tall and as wide as its
 * column. Taller phones zoom the whole scene a little (`--pk`), so it gains
 * room and type together; the box's height is the same in every state, so
 * the pinned panel never grows.
 */

/** The scene's height, before the zoom. */
export const SCENE_H = 160;

/** Taller phones (and the side-by-side column on taller screens) zoom the scene by this much. */
export const TALL_ZOOM = 1.1;

/** Sets the zoom for the scene and its placeholder: on the figure, so both read it. */
export const ZOOM_CLASSES = "[--pk:1] [@media(min-height:740px)]:[--pk:1.1]";

/** The scene's box, zoomed: what the placeholder keeps while it loads. */
export const SCENE_BOX_H = `calc(${SCENE_H}px * var(--pk, 1))`;

/** A sheet's face: its header (the name), a row, the padding under the rows, and its side inset. */
export const FACE = { head: 22, row: 17, pad: 5, side: 12 } as const;

export function faceHeight(rows: number): number {
  return FACE.head + rows * FACE.row + FACE.pad;
}

/** The one table at rest, every row in it. */
export const TABLE_FACE_H = faceHeight(ORG_ROWS.length);

/** The empty result: as tall as the largest one. */
export const EMPTY_FACE_H = faceHeight(MOST_ROWS);

/**
 * The scene widths to check, in scene px: a 320px phone's column, the
 * common phones (zoomed or not), up to the side-by-side column's cap.
 */
export const SCENE_WIDTHS = [288, 325, 328, 343, 362, 480] as const;
