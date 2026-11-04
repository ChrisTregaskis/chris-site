import {
  INITIAL_LEAK,
  type LeakState,
  leakReducer,
  type LeakView,
  leakView,
} from "../leakTest";
import { ORGS } from "../organisations";
import { SCENE_H } from "./sceneMeasures";
import { type Point, type SceneView, throughScene } from "./scene3d";

/*
 * Exploration: what the phone drawings' tests walk through. Every state
 * the story and the leak test can reach, and a check that a projected
 * point stays inside the scene's box.
 */

/** Every state: each stage, each sign-in, asking or not. */
export function everyView(): LeakView[] {
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

/** Projects points and reports any that land outside the box (by more than `slack` px, or `top` px above it). */
export function outside(
  points: Point[],
  view: SceneView,
  { slack = 1, top = slack }: { slack?: number; top?: number } = {},
): { x: number; y: number }[] {
  return points
    .map((p) => throughScene(p, view))
    .filter(
      ({ x, y }) =>
        x < -slack || x > view.width + slack || y < -top || y > SCENE_H + slack,
    );
}
