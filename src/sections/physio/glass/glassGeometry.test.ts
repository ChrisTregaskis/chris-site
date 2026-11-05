import { describe, expect, it } from "vitest";
import {
  INITIAL_LEAK,
  type LeakState,
  leakReducer,
  type LeakView,
  leakView,
  spotOf,
} from "../leakTest";
import { ORGS, rowsOf } from "../organisations";
import { faceHeight, GLASS, SCENE_H, TABLE_FACE_H } from "./glassGeometry";

/*
 * Just enough of CSS 3D to check the drawing on paper: that nothing leaves
 * the scene's box in any state. The axes are CSS's: x right, y down, z
 * towards the viewer; angles in degrees, and a positive rotateX tips an
 * element's top away, as in CSS.
 */
interface Point {
  x: number;
  y: number;
  z: number;
}

const RAD = Math.PI / 180;

/** `rotateX(deg)` about a transform origin at height `oy` (and depth 0). */
function rotateX(p: Point, deg: number, oy: number): Point {
  const cos = Math.cos(deg * RAD);
  const sin = Math.sin(deg * RAD);
  const y = p.y - oy;
  return { x: p.x, y: oy + y * cos - p.z * sin, z: y * sin + p.z * cos };
}

/** The four corners of a rectangle lying in a plane at depth `z`. */
function corners(
  left: number,
  top: number,
  width: number,
  height: number,
  z: number,
): Point[] {
  return [
    { x: left, y: top, z },
    { x: left + width, y: top, z },
    { x: left, y: top + height, z },
    { x: left + width, y: top + height, z },
  ];
}

interface SceneView {
  width: number;
  tilt: number;
}

/** Where a point in the scene lands on screen, through the scene's lean and perspective. */
function throughScene(p: Point, view: SceneView): { x: number; y: number } {
  const tilted = rotateX(p, view.tilt, GLASS.y);
  const k = GLASS.perspective / (GLASS.perspective - tilted.z);
  const ox = view.width / 2;
  return {
    x: ox + (tilted.x - ox) * k,
    y: GLASS.eyeY + (tilted.y - GLASS.eyeY) * k,
  };
}

/** Projects points and reports any that land outside the scene's box. */
function outside(points: Point[], view: SceneView): { x: number; y: number }[] {
  return points
    .map((p) => throughScene(p, view))
    .filter(
      ({ x, y }) => x < -1 || x > view.width + 1 || y < -1 || y > SCENE_H + 1,
    );
}

/** Every state: each stage, each sign-in, asking or not. */
function everyView(): LeakView[] {
  const views: LeakView[] = [];
  for (const stage of [1, 2, 3]) {
    for (const org of ORGS) {
      const picked: LeakState = leakReducer(INITIAL_LEAK, {
        type: "pick",
        org,
      });
      views.push(leakView(stage, picked));
      views.push(leakView(stage, leakReducer(picked, { type: "try" })));
    }
  }
  return views;
}

/**
 * The scene widths to check, in scene px: a 320px phone's column, the
 * common phones (zoomed or not), up to the side-by-side column's cap.
 */
const SCENE_WIDTHS = [288, 325, 328, 343, 362, 480] as const;

const sceneAt = (width: number, apart: boolean): SceneView => ({
  width,
  tilt: apart ? GLASS.apart : GLASS.rest,
});

/** A plate `height` tall standing with its foot at (y, z), turned by `deg` about its foot. */
function standing(
  width: number,
  foot: number,
  z: number,
  height: number,
  deg: number,
): Point[] {
  const { inset } = GLASS;
  return corners(inset, foot - height, width - 2 * inset, height, z).map((p) =>
    rotateX(p, deg, foot),
  );
}

/** A strip `height` deep hanging under an edge at `y`, turned to face the viewer. */
function facing(
  width: number,
  inset: number,
  y: number,
  height: number,
): Point[] {
  return corners(inset, y, width - 2 * inset, height, 0)
    .map((p) => rotateX({ ...p, y: p.y - y }, -GLASS.apart, 0))
    .map((p) => ({ ...p, y: p.y + y }));
}

describe("the glass floor", () => {
  it("keeps the table, the result, the glass, its edge and the lying sheets inside the scene, in every state and width", () => {
    for (const width of SCENE_WIDTHS) {
      const table = corners(
        GLASS.inset,
        GLASS.table.y,
        width - 2 * GLASS.inset,
        TABLE_FACE_H,
        0,
      );
      expect(outside(table, sceneAt(width, false))).toEqual([]);
      const scene = sceneAt(width, true);
      for (const org of ORGS) {
        const height = faceHeight(rowsOf(org).length);
        const result = standing(
          width,
          GLASS.y,
          GLASS.stand.z,
          height,
          -GLASS.apart,
        );
        expect(outside(result, scene)).toEqual([]);
      }
      const empty = standing(
        width,
        GLASS.y,
        GLASS.stand.z,
        GLASS.emptyH,
        -GLASS.apart,
      );
      expect(outside(empty, scene)).toEqual([]);
      const { inset } = GLASS.edge;
      const glass = [
        ...corners(inset, GLASS.y, width - 2 * inset, 0, 0),
        ...corners(inset, GLASS.y, width - 2 * inset, 0, -GLASS.depth),
      ];
      expect(outside(glass, scene)).toEqual([]);
      expect(
        outside(facing(width, inset, GLASS.y, GLASS.edge.h), scene),
      ).toEqual([]);
      const { slab } = GLASS;
      const lying = [
        ...corners(slab.inset, slab.y, width - 2 * slab.inset, 0, 0),
        ...corners(slab.inset, slab.y, width - 2 * slab.inset, 0, -slab.depth),
      ];
      expect(outside(lying, scene)).toEqual([]);
      expect(
        outside(facing(width, slab.inset, slab.y, slab.spine), scene),
      ).toEqual([]);
      // An attempt lifts a sheet's far end up through the glass, and stays in the box.
      const far = rotateX(
        { x: width / 2, y: slab.y, z: -slab.depth },
        GLASS.lift,
        slab.y,
      );
      expect(far.y).toBeLessThan(GLASS.y);
      expect(outside([far], scene)).toEqual([]);
    }
  });

  it("stands the result on the glass, and keeps the names under its edge", () => {
    for (const width of SCENE_WIDTHS) {
      const scene = sceneAt(width, true);
      const at = (y: number, z: number) =>
        throughScene({ x: width / 2, y, z }, scene).y;
      const front = at(GLASS.y, 0);
      const back = at(GLASS.y, -GLASS.depth);
      const foot = at(GLASS.y, GLASS.stand.z);
      expect(foot).toBeLessThan(front);
      expect(foot).toBeGreaterThan(back);
      const edgeBottom = throughScene(
        facing(width, GLASS.edge.inset, GLASS.y, GLASS.edge.h)[2],
        scene,
      ).y;
      expect(at(GLASS.slab.y, 0)).toBeGreaterThanOrEqual(edgeBottom - 1);
    }
    // Every state holds at most three sheets under the glass, one per column.
    for (const view of everyView()) {
      const held = ORGS.filter((org) => spotOf(view, org).at === "held");
      expect(held.length).toBeLessThanOrEqual(3);
    }
  });
});
