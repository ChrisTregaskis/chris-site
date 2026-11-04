import { describe, expect, it } from "vitest";
import {
  INITIAL_LEAK,
  type LeakState,
  leakReducer,
  leakView,
  spotOf,
} from "../leakTest";
import { ORGS, rowsOf } from "../organisations";
import {
  FLAT,
  FLAT_BOX_H,
  FLAT_EMPTY_H,
  FLAT_H,
  FLAT_LAYER,
  FLAT_RESULT_Y,
  FLAT_RULE_Y,
  flatPose,
} from "./flatGeometry";

/** Every state the story and the leak test can reach: each stage, each sign-in, asking or not. */
function everyState(): { stage: number; state: LeakState }[] {
  const states: { stage: number; state: LeakState }[] = [];
  for (const stage of [1, 2, 3]) {
    for (const org of ORGS) {
      const picked = leakReducer(INITIAL_LEAK, { type: "pick", org });
      states.push({ stage, state: picked });
      states.push({ stage, state: leakReducer(picked, { type: "try" }) });
    }
  }
  return states;
}

const posesOf = (stage: number, state: LeakState) => {
  const view = leakView(stage, state);
  return {
    view,
    poses: ORGS.map((org) => ({
      org,
      spot: spotOf(view, org),
      pose: flatPose(spotOf(view, org), rowsOf(org).length),
    })),
  };
};

describe("the flat stack", () => {
  it("keeps every sheet inside the picture, in every state", () => {
    for (const { stage, state } of everyState()) {
      for (const { pose } of posesOf(stage, state).poses) {
        expect(pose.y).toBeGreaterThanOrEqual(0);
        expect(pose.y + pose.height).toBeLessThanOrEqual(FLAT_H);
      }
    }
    expect(FLAT_RESULT_Y + FLAT_EMPTY_H).toBeLessThanOrEqual(FLAT_H);
  });

  it("holds the rest of the table inside the policy box, above its rule, each tab's name showing", () => {
    for (const { stage, state } of everyState()) {
      const held = posesOf(stage, state)
        .poses.filter(({ spot }) => spot.at === "held")
        .map(({ pose }) => pose)
        .sort((a, b) => a.y - b.y);
      for (const pose of held) {
        expect(pose.open).toBe(false);
        expect(pose.y + pose.height).toBeLessThanOrEqual(FLAT_RULE_Y);
        expect(pose.layer).toBeLessThan(FLAT_LAYER.policy);
      }
      // Each tab shows at least 18px (its name's line) above the one in front.
      for (let i = 1; i < held.length; i++) {
        expect(held[i].y - held[i - 1].y).toBeGreaterThanOrEqual(18);
        // Front tabs are lower, wider and painted over the ones behind.
        expect(held[i].inset).toBeLessThan(held[i - 1].inset);
        expect(held[i].layer).toBeGreaterThan(held[i - 1].layer);
      }
    }
  });

  it("opens the result out below the box, over the policy's veil", () => {
    for (const { stage, state } of everyState()) {
      const { view, poses } = posesOf(stage, state);
      const result = poses.filter(({ spot }) => spot.at === "result");
      if (!view.asked || view.returned === null) {
        expect(result).toHaveLength(0);
        continue;
      }
      expect(result).toHaveLength(1);
      expect(result[0].org).toBe(view.returned);
      expect(result[0].pose.y).toBeGreaterThanOrEqual(FLAT_BOX_H);
      expect(result[0].pose.layer).toBeGreaterThan(FLAT_LAYER.policy);
      expect(result[0].pose.open).toBe(true);
    }
  });

  it("lets an attempt push at the box's edge without breaking out of it", () => {
    const front = flatPose({ at: "held", slot: 0 }, 2);
    expect(front.y + front.height + FLAT.lunge).toBeLessThanOrEqual(FLAT_BOX_H);
  });

  it("lays the whole table out at rest", () => {
    const { poses } = posesOf(1, INITIAL_LEAK);
    for (const { pose } of poses) {
      expect(pose).toMatchObject({ y: 0, inset: 0, open: true });
      expect(pose.height).toBeLessThanOrEqual(FLAT_H);
    }
  });
});
