import { describe, expect, it } from "vitest";
import { spotOf } from "../../leakTest";
import { ORGS, rowsOf } from "../../organisations";
import {
  corners,
  type Point,
  rotateX,
  type SceneView,
  throughScene,
} from "../scene3d";
import { faceHeight, SCENE_WIDTHS, TABLE_FACE_H } from "../sceneMeasures";
import { everyView, outside } from "../sceneStates";
import { FLOOR } from "./floorGeometry";

const sceneAt = (width: number, apart: boolean): SceneView => ({
  width,
  perspective: FLOOR.perspective,
  eyeY: FLOOR.eyeY,
  tilt: apart ? FLOOR.apart : FLOOR.rest,
  axisY: FLOOR.y,
});

/** A plate `height` tall standing with its foot at (y, z), turned by `deg` about its foot. */
function standing(
  width: number,
  inset: number,
  foot: number,
  z: number,
  height: number,
  deg: number,
): Point[] {
  return corners(inset, foot - height, width - 2 * inset, height, z).map((p) =>
    rotateX(p, deg, foot),
  );
}

/** A strip `height` deep hanging under an edge at (y, z), turned to face the viewer. */
function facing(
  width: number,
  inset: number,
  y: number,
  height: number,
): Point[] {
  return corners(inset, y, width - 2 * inset, height, 0)
    .map((p) => rotateX({ ...p, y: p.y - y }, -FLOOR.apart, 0))
    .map((p) => ({ ...p, y: p.y + y }));
}

describe("draft C, the glass floor", () => {
  it("keeps the table, the result, the glass, its edge and the lying sheets inside the scene, in every state and width", () => {
    for (const width of SCENE_WIDTHS) {
      expect(
        outside(
          corners(
            FLOOR.inset,
            FLOOR.table.y,
            width - 2 * FLOOR.inset,
            TABLE_FACE_H,
            0,
          ),
          sceneAt(width, false),
        ),
      ).toEqual([]);
      const scene = sceneAt(width, true);
      for (const org of ORGS) {
        const result = standing(
          width,
          FLOOR.inset,
          FLOOR.y,
          FLOOR.stand.z,
          faceHeight(rowsOf(org).length),
          -FLOOR.apart,
        );
        expect(outside(result, scene)).toEqual([]);
      }
      const empty = standing(
        width,
        FLOOR.inset,
        FLOOR.y,
        FLOOR.stand.z,
        FLOOR.emptyH,
        -FLOOR.apart,
      );
      expect(outside(empty, scene)).toEqual([]);
      const { inset } = FLOOR.edge;
      const glass = [
        ...corners(inset, FLOOR.y, width - 2 * inset, 0, 0),
        ...corners(inset, FLOOR.y, width - 2 * inset, 0, -FLOOR.depth),
      ];
      expect(outside(glass, scene)).toEqual([]);
      expect(
        outside(facing(width, inset, FLOOR.y, FLOOR.edge.h), scene),
      ).toEqual([]);
      const { slab } = FLOOR;
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
        FLOOR.lift,
        slab.y,
      );
      expect(far.y).toBeLessThan(FLOOR.y);
      expect(outside([far], scene)).toEqual([]);
    }
  });

  it("stands the result on the glass, and keeps the names under its edge", () => {
    for (const width of SCENE_WIDTHS) {
      const scene = sceneAt(width, true);
      const at = (y: number, z: number) =>
        throughScene({ x: width / 2, y, z }, scene).y;
      const front = at(FLOOR.y, 0);
      const back = at(FLOOR.y, -FLOOR.depth);
      const foot = at(FLOOR.y, FLOOR.stand.z);
      expect(foot).toBeLessThan(front);
      expect(foot).toBeGreaterThan(back);
      const edgeBottom = throughScene(
        facing(width, FLOOR.edge.inset, FLOOR.y, FLOOR.edge.h)[2],
        scene,
      ).y;
      expect(at(FLOOR.slab.y, 0)).toBeGreaterThanOrEqual(edgeBottom - 1);
    }
    // Every state holds at most three sheets under the glass, one per column.
    for (const view of everyView()) {
      const held = ORGS.filter((org) => spotOf(view, org).at === "held");
      expect(held.length).toBeLessThanOrEqual(3);
    }
  });
});
