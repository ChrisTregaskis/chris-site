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
  flatSpan,
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
      pose: flatPose(spotOf(view, org), org, rowsOf(org).length),
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

  it("holds the rest of the table inside the policy box as tabs, each in its own column above the rule", () => {
    for (const { stage, state } of everyState()) {
      const held = posesOf(stage, state).poses.filter(
        ({ spot }) => spot.at === "held",
      );
      for (const { org, pose } of held) {
        expect(pose.open).toBe(false);
        expect(pose.height).toBe(FLAT.tab);
        expect(pose.y + pose.height).toBeLessThanOrEqual(FLAT_RULE_Y);
        expect(pose.layer).toBeLessThan(FLAT_LAYER.policy);
        // Table order: a held tab never moves while it's held.
        expect(pose.column).toBe(ORGS.indexOf(org));
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
      expect(result[0].pose).toMatchObject({ open: true, column: null });
    }
  });

  it("lets an attempt push into the box's rule without breaking out of it", () => {
    const tab = flatPose({ at: "held", slot: 0 }, "Birch", 2);
    expect(tab.y + tab.height + FLAT.lunge).toBeGreaterThan(FLAT_RULE_Y);
    expect(tab.y + tab.height + FLAT.lunge).toBeLessThanOrEqual(FLAT_BOX_H);
  });

  it("lays the whole table out at rest, full width", () => {
    const { poses } = posesOf(1, INITIAL_LEAK);
    for (const { pose } of poses) {
      expect(pose).toMatchObject({ y: 0, column: null, open: true });
      expect(pose.height).toBeLessThanOrEqual(FLAT_H);
    }
    expect(flatSpan(null)).toEqual({ left: "0px", width: "100%" });
  });

  it("shares the box's inner width between the three columns", () => {
    expect(flatSpan(0).left).toBe(
      "calc(6px + 0 * (((100% - 24px) / 3) + 6px))",
    );
    expect(flatSpan(2).width).toBe("calc(((100% - 24px) / 3))");
  });
});
