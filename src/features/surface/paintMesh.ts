import { type Facet } from "./meshFacets";
import { type Reach, reachAt, reachStops } from "./reach";
import { shadeFill } from "./shading";

export type Rgb = readonly [number, number, number];

/** How the facets are put on a canvas. */
export interface MeshInk {
  /** The paper's level (0–255), for the fills' alphas. */
  paper: number;
  /** The shadow and pencil colour, and the lit facets' colour. */
  ink: Rgb;
  light: Rgb;
  /** The pencil line's alpha at full strength (0: no lines). */
  edge: number;
  /** The band of the page the canvas holds, in page px. */
  top: number;
  bottom: number;
  /** Where on the page the mesh lies (null: everywhere). */
  reach: Reach | null;
}

/** Pencil lines are stroked in this many strengths, each as one path. */
export const LINE_STEPS = 8;

/** One pencil line: its two ends. */
export type Segment = readonly [number, number, number, number];

/**
 * The net's edges, each once (an edge two facets share is drawn at the
 * stronger of their strengths), grouped by strength rounded to eighths.
 * Each group is stroked as one path, so where lines meet they don't darken
 * each other: a line is one alpha wherever it runs, which is what keeps
 * text over it at AA.
 */
export function lineGroups(facets: readonly Facet[]): Map<number, Segment[]> {
  const edges = new Map<string, { segment: Segment; strength: number }>();
  for (const { points: p, strength } of facets) {
    for (const [a, b] of [
      [0, 2],
      [2, 4],
      [4, 0],
    ]) {
      const from = [p[a], p[a + 1]] as const;
      const to = [p[b], p[b + 1]] as const;
      const [first, second] =
        from[0] < to[0] || (from[0] === to[0] && from[1] <= to[1])
          ? [from, to]
          : [to, from];
      const key = `${first[0]},${first[1]},${second[0]},${second[1]}`;
      const known = edges.get(key);
      if (!known) {
        edges.set(key, {
          segment: [first[0], first[1], second[0], second[1]],
          strength,
        });
      } else if (strength > known.strength) known.strength = strength;
    }
  }
  const groups = new Map<number, Segment[]>();
  for (const { segment, strength } of edges.values()) {
    const step = Math.round(strength * LINE_STEPS) / LINE_STEPS;
    if (step <= 0) continue;
    const group = groups.get(step);
    if (group) group.push(segment);
    else groups.set(step, [segment]);
  }
  return groups;
}

/** Whether a facet lies wholly where the mesh is absent. */
export function outOfReach(facet: Facet, reach: Reach | null): boolean {
  const [, ay, , by, , cy] = facet.points;
  return (
    reachAt(ay, reach) === 0 &&
    reachAt(by, reach) === 0 &&
    reachAt(cy, reach) === 0
  );
}

/**
 * Paints facets onto a context already set to page px. The reach is a
 * vertical gradient in every fill and stroke, so the mesh fades down the
 * page continuously, pixel by pixel, never in whole facets.
 */
export function paintMesh(
  context: CanvasRenderingContext2D,
  facets: readonly Facet[],
  inkSpec: MeshInk,
): void {
  const { paper, ink, light, edge, top, bottom, reach } = inkSpec;
  const inkLevel = (ink[0] + ink[1] + ink[2]) / 3;
  const stops = reachStops(top, bottom, reach);
  const gradient = (rgb: Rgb) => {
    const fill = context.createLinearGradient(0, top, 0, bottom);
    for (const { offset, alpha } of stops) {
      fill.addColorStop(
        Math.min(1, Math.max(0, offset)),
        `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(4)})`,
      );
    }
    return fill;
  };
  const inkStyle = gradient(ink);
  const lightStyle = gradient(light);
  const shown = facets.filter((facet) => !outOfReach(facet, reach));

  const trace = (points: Facet["points"]) => {
    context.moveTo(points[0], points[1]);
    context.lineTo(points[2], points[3]);
    context.lineTo(points[4], points[5]);
    context.closePath();
  };

  for (const { points, levels } of shown) {
    if (levels === 0) continue;
    const { towards, alpha } = shadeFill(levels, paper, inkLevel);
    if (alpha <= 0) continue;
    context.globalAlpha = alpha;
    context.fillStyle = towards === "light" ? lightStyle : inkStyle;
    context.beginPath();
    trace(points);
    context.fill();
  }

  if (edge > 0) {
    context.lineWidth = 1;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = inkStyle;
    for (const [strength, group] of lineGroups(shown)) {
      context.globalAlpha = Math.min(1, edge * strength);
      context.beginPath();
      for (const [x1, y1, x2, y2] of group) {
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
      }
      context.stroke();
    }
  }
  context.globalAlpha = 1;
}
