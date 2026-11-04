import { describe, expect, it } from "vitest";
import { spotOf } from "../../leakTest";
import { ORGS, rowsOf } from "../../organisations";
import { corners, type SceneView, throughScene } from "../scene3d";
import { FACE, faceHeight, SCENE_WIDTHS, TABLE_FACE_H } from "../sceneMeasures";
import { everyView, outside } from "../sceneStates";
import { DRAWER, drawerPose } from "./drawerGeometry";

const sceneAt = (width: number, apart: boolean): SceneView => ({
  width,
  perspective: DRAWER.perspective,
  eyeY: DRAWER.eyeY,
  tilt: apart ? DRAWER.apart : DRAWER.rest,
  axisY: DRAWER.axisY,
});

const card = (width: number, y: number, height: number, z: number) =>
  corners(DRAWER.inset, y, width - 2 * DRAWER.inset, height, z);

describe("draft B, the drawer", () => {
  it("keeps every card, the drawer's front and the empty result inside the scene, in every state and width", () => {
    for (const width of SCENE_WIDTHS) {
      expect(
        outside(
          card(width, DRAWER.table.y, TABLE_FACE_H, 0),
          sceneAt(width, false),
        ),
      ).toEqual([]);
      for (const view of everyView()) {
        const scene = sceneAt(width, view.asked);
        for (const org of ORGS) {
          const spot = spotOf(view, org);
          const { y, z } = drawerPose(spot);
          const height =
            spot.at === "held"
              ? FACE.head + DRAWER.held.depth
              : faceHeight(rowsOf(org).length);
          expect(outside(card(width, y, height, z), scene)).toEqual([]);
          if (view.asking && org === view.target) {
            const jump = card(
              width,
              y + DRAWER.jump.y,
              FACE.head,
              z + DRAWER.jump.z,
            );
            expect(outside(jump, scene)).toEqual([]);
          }
        }
        if (!view.asked) continue;
        const { inset, y, h, z } = DRAWER.front;
        expect(
          outside(corners(inset, y, width - 2 * inset, h, z), scene),
        ).toEqual([]);
        expect(
          outside(card(width, DRAWER.empty.y, DRAWER.empty.h, 0), scene),
        ).toEqual([]);
      }
    }
  });

  it("stands every held card's tab on the drawer's lid, its name above it, and the result clear of the policy's words", () => {
    for (const width of SCENE_WIDTHS) {
      const scene = sceneAt(width, true);
      const lid = throughScene(
        { x: width / 2, y: DRAWER.front.y, z: DRAWER.front.z },
        scene,
      ).y;
      const words = throughScene(
        {
          x: width / 2,
          y: DRAWER.front.y + DRAWER.legendTop + 20,
          z: DRAWER.front.z,
        },
        scene,
      ).y;
      for (const view of everyView().filter((v) => v.asked)) {
        for (const org of ORGS) {
          const spot = spotOf(view, org);
          const { y, z } = drawerPose(spot);
          const at = (dy: number) =>
            throughScene({ x: width / 2, y: y + dy, z }, scene).y;
          if (spot.at === "held") {
            // The tab's foot meets the lid (the body hides behind the front).
            expect(Math.abs(at(FACE.head) - lid)).toBeLessThan(3);
            expect(at(5)).toBeGreaterThan(0);
          } else {
            expect(at(0)).toBeGreaterThan(words);
          }
        }
        const empty = throughScene(
          { x: width / 2, y: DRAWER.empty.y, z: 0 },
          scene,
        ).y;
        expect(empty).toBeGreaterThan(words);
      }
    }
  });
});
