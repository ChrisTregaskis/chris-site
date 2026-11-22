import { type Box } from "./mesh";

/**
 * Where the mesh steps back. Around each drawing on the page (the Wayfinder
 * figure, the physio rings, the Burpees count) the paper goes almost quiet,
 * easing back to full texture over a soft band, so a drawing never sits on
 * texture and no edge marks where the quiet ends. Boxes are the drawings'
 * real positions on the page, measured every frame they can move (pinned or
 * sticky, a drawing moves against the page as it scrolls).
 */
export interface Falloff {
  /** Quiet ground kept clear around each box before the fade begins, in px. */
  margin: number;
  /** How far the mesh takes to come back to full strength, in px. */
  width: number;
  /** What's left of the mesh at a drawing: almost nothing. */
  floor: number;
}

/** How far a point is from a box, 0 inside it. */
export function distanceToBox(x: number, y: number, box: Box): number {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.hypot(dx, dy);
}

/** Hermite's smoothstep: 0 below `edge0`, 1 above `edge1`, no corner at either end. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * The mesh's strength at a point, 1 in open paper down to `floor` at a
 * drawing: the quietest of what each drawing asks for, so two drawings
 * close together never add up to a boundary between them.
 */
export function meshStrengthAt(
  x: number,
  y: number,
  boxes: readonly Box[],
  falloff: Falloff,
): number {
  const { margin, width, floor } = falloff;
  let strength = 1;
  for (const box of boxes) {
    const d = distanceToBox(x, y, box);
    const s = floor + (1 - floor) * smoothstep(margin, margin + width, d);
    if (s < strength) strength = s;
  }
  return strength;
}
