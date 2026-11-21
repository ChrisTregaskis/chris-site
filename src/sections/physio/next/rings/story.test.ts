import { describe, expect, it } from "vitest";
import { NODES, type NodeId } from "./geometry";
import {
  NODE_STEP,
  revealAt,
  ROUTE_STEP,
  STEP_ORDER,
  stepNumber,
  STEPS,
  TRY_STEP,
} from "./story";

describe("the rings' story", () => {
  it("reveals from the outside in, then the side ways in, then the journeys", () => {
    expect(STEP_ORDER).toEqual([
      "edge",
      "network",
      "functions",
      "centre",
      "queue",
      "admin",
      "try",
    ]);
    expect(TRY_STEP).toBe(STEP_ORDER.length);
  });

  it("reveals every node with some step", () => {
    for (const id of Object.keys(NODES) as NodeId[]) {
      expect(NODE_STEP.get(id), id).toBeDefined();
    }
  });

  it("only ever picks out what its own step, or an earlier one, has drawn", () => {
    for (const id of STEP_ORDER) {
      const n = stepNumber(id);
      for (const detail of STEPS[id].details) {
        for (const node of detail.nodes) {
          expect(NODE_STEP.get(node), detail.id).toBeLessThanOrEqual(n);
        }
        for (const route of detail.routes ?? []) {
          expect(ROUTE_STEP.get(route), detail.id).toBeLessThanOrEqual(n);
        }
      }
    }
  });

  it("hides what's to come, lights what's new and keeps what's been shown", () => {
    expect(revealAt(3, 0, false)).toBe("hidden");
    expect(revealAt(3, 2, false)).toBe("hidden");
    expect(revealAt(3, 3, false)).toBe("new");
    expect(revealAt(3, 4, false)).toBe("shown");
    expect(revealAt(3, TRY_STEP, false)).toBe("shown");
    expect(revealAt(3, 0, true)).toBe("shown");
  });

  it("keeps its copy free of connector dashes", () => {
    for (const id of STEP_ORDER) {
      const step = STEPS[id];
      for (const text of [
        step.kicker,
        step.heading,
        step.text,
        ...step.details.map((d) => d.text),
      ]) {
        expect(text).not.toMatch(/[\u2013\u2014]/);
      }
    }
  });
});
