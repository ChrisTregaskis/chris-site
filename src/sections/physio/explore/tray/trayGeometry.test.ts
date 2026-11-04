import { describe, expect, it } from "vitest";
import { spotOf } from "../../leakTest";
import { ORGS, rowsOf } from "../../organisations";
import { corners, type SceneView, throughScene } from "../scene3d";
import {
  FACE,
  faceHeight,
  SCENE_H,
  SCENE_WIDTHS,
  TABLE_FACE_H,
} from "../sceneMeasures";
import { everyView, outside } from "../sceneStates";
import { TRAY, trayPose } from "./trayGeometry";

const sceneAt = (width: number, apart: boolean): SceneView => ({
  width,
  perspective: TRAY.perspective,
  eyeY: TRAY.eyeY,
  tilt: apart ? TRAY.apart : TRAY.rest,
  axisY: TRAY.axisY,
});

/** A sheet's plate across the scene at a height and depth. */
const plate = (width: number, y: number, height: number, z: number) =>
  corners(TRAY.inset, y, width - 2 * TRAY.inset, height, z);

/** Where a name's glyphs sit on screen, top and bottom, on a sheet at (y, z). */
function nameBand(width: number, y: number, z: number) {
  const view = sceneAt(width, true);
  const x = TRAY.inset + FACE.side;
  return {
    top: throughScene({ x, y: y + 5, z }, view).y,
    bottom: throughScene({ x, y: y + 17, z }, view).y,
  };
}

describe("draft A, the tray", () => {
  it("keeps every sheet, the policy and the empty result inside the scene, in every state and width", () => {
    for (const width of SCENE_WIDTHS) {
      expect(
        outside(
          plate(width, TRAY.table.y, TABLE_FACE_H, 0),
          sceneAt(width, false),
        ),
      ).toEqual([]);
      for (const view of everyView()) {
        const scene = sceneAt(width, view.asked);
        for (const org of ORGS) {
          const spot = spotOf(view, org);
          const { y, z } = trayPose(spot, view.asking);
          const points = plate(width, y, faceHeight(rowsOf(org).length), z);
          expect(outside(points, scene)).toEqual([]);
          if (view.asking && org === view.target) {
            const lunge = plate(
              width,
              y + TRAY.lunge.y,
              FACE.head,
              z + TRAY.lunge.z,
            );
            expect(outside(lunge, scene)).toEqual([]);
          }
        }
        if (!view.asked) continue;
        const { inset, y, h, z } = TRAY.plane;
        // The plane's name sits on its top edge, rising 11px above it.
        expect(
          outside(corners(inset, y, width - 2 * inset, h, z), scene, {
            top: 12,
          }),
        ).toEqual([]);
        expect(
          outside(plate(width, TRAY.empty.y, TRAY.empty.h, 0), scene),
        ).toEqual([]);
      }
    }
  });

  it("shows every held name whole: none covered by the one in front, the result or the rule", () => {
    for (const width of SCENE_WIDTHS) {
      for (const view of everyView().filter((v) => v.asked)) {
        const held = ORGS.map((org) => spotOf(view, org))
          .filter((spot) => spot.at === "held")
          .map((spot) => trayPose(spot, view.asking))
          .sort((a, b) => b.y - a.y);
        const bands = held.map(({ y, z }) => nameBand(width, y, z));
        const scene = sceneAt(width, true);
        const front = view.asking ? TRAY.empty.y : TRAY.result.y;
        const resultTop = throughScene(
          { x: TRAY.inset + FACE.side, y: front, z: 0 },
          scene,
        ).y;
        const ruleBottom = throughScene(
          {
            x: TRAY.plane.inset + 12,
            y: TRAY.plane.y + TRAY.ruleTop + 18,
            z: TRAY.plane.z,
          },
          scene,
        ).y;
        // Front to back: each name clear of the sheet in front of it.
        expect(bands[0].bottom).toBeLessThan(resultTop);
        for (let i = 1; i < bands.length; i += 1) {
          // The sheet in front starts 5px above its name's glyphs.
          expect(bands[i].bottom).toBeLessThan(bands[i - 1].top - 1);
        }
        expect(bands[bands.length - 1].top).toBeGreaterThan(ruleBottom - 4);
      }
    }
  });

  it("is as tall as the scene, whatever it holds", () => {
    expect(TRAY.plane.y + TRAY.plane.h).toBeLessThanOrEqual(SCENE_H);
    expect(TRAY.empty.y + TRAY.empty.h).toBeLessThanOrEqual(SCENE_H);
  });
});
