import { describe, expect, it } from "vitest";
import {
  DRAW_PLANS,
  drawnAt,
  type DrawPlan,
  ease,
  FADE_SPAN,
  fractionAlong,
  ringPoints,
  shownAt,
} from "./draw";
import { NODES, ROUTES } from "./geometry";
import { STEP_ORDER, STEPS } from "./story";

const EPSILON = 1e-6;
/** A fine sweep of a step's progress, there and back. */
const SWEEP = Array.from({ length: 401 }, (_, i) => i / 400);

const strokeOf = (plan: DrawPlan, key: string) => {
  const stroke = plan.strokes.find((s) => s.key === key);
  if (!stroke) throw new Error(`no stroke ${key}`);
  return stroke;
};

/** The order a step's fades first appear in as its progress rises. */
function appearing(plan: DrawPlan): string[] {
  const seen: string[] = [];
  for (const p of SWEEP) {
    for (const fade of plan.fades) {
      if (shownAt(fade, p) > 0 && !seen.includes(fade.key)) seen.push(fade.key);
    }
  }
  return seen;
}

/** Where in a falling sweep each fade is gone (lower: gone sooner). */
function goneAt(plan: DrawPlan): Map<string, number> {
  const falling = [...SWEEP].reverse();
  return new Map(
    plan.fades.map((fade) => [
      fade.key,
      falling.findIndex((p) => shownAt(fade, p) === 0),
    ]),
  );
}

describe("drawing the rings", () => {
  it("finds where a node sits along its line", () => {
    expect(fractionAlong(ROUTES["visitor-api"], NODES.api.at)).toBeCloseTo(1);
    expect(
      fractionAlong(ROUTES["engineer-host"], NODES.engineer.at),
    ).toBeCloseTo(0);
    // The gate is part way down the engineer's spoke, before the host.
    const gate = fractionAlong(ROUTES["engineer-host"], NODES.gate.at);
    expect(gate).toBeGreaterThan(0.2);
    expect(gate).toBeLessThan(
      fractionAlong(ROUTES["engineer-host"], NODES.host.at),
    );
    // Round the network's wall from twelve o'clock: storage, the way out, sign-in.
    const wall = ringPoints("ring:net");
    expect(fractionAlong(wall, NODES.endpointStorage.at)).toBeLessThan(
      fractionAlong(wall, NODES.noRoute.at),
    );
    expect(fractionAlong(wall, NODES.noRoute.at)).toBeLessThan(
      fractionAlong(wall, NODES.endpointSignIn.at),
    );
  });

  it("draws everything each step reveals, finishing by the end", () => {
    for (const id of STEP_ORDER) {
      const plan = DRAW_PLANS[id];
      const fades = plan.fades.map((f) => f.key);
      const strokes = plan.strokes.map((s) => s.key);
      for (const node of STEPS[id].reveals.nodes) {
        expect(fades, id).toContain(node);
      }
      for (const route of STEPS[id].reveals.routes) {
        // fn-policy is drawn only when a journey lights it.
        if (route !== "fn-policy") expect(strokes, id).toContain(route);
      }
      for (const stroke of plan.strokes) {
        expect(stroke.start).toBeGreaterThanOrEqual(0);
        expect(drawnAt(stroke, 1)).toBe(1);
        expect(drawnAt(stroke, 0)).toBe(0);
      }
      for (const fade of plan.fades) {
        expect(shownAt(fade, 1), `${id}: ${fade.key}`).toBe(1);
        expect(fade.at + FADE_SPAN).toBeLessThanOrEqual(1 + EPSILON);
      }
    }
  });

  it("shows an icon only once its line has reached it", () => {
    for (const id of STEP_ORDER) {
      const plan = DRAW_PLANS[id];
      for (const fade of plan.fades) {
        if (!fade.on) continue;
        const line = strokeOf(plan, fade.on.stroke);
        for (const p of SWEEP) {
          if (shownAt(fade, p) > 0) {
            expect(
              drawnAt(line, p) + EPSILON,
              `${id}: ${fade.key} at ${p}`,
            ).toBeGreaterThanOrEqual(fade.on.fraction);
          }
        }
      }
    }
  });

  it("draws the edge from the visitor out, storage last", () => {
    const order = appearing(DRAW_PLANS.edge);
    expect(order[0]).toBe("visitor");
    expect(order.indexOf("api")).toBeLessThan(order.indexOf("cdn"));
    expect(order.at(-1)).toBe("storage");
  });

  it("draws direct access from the engineer inward: the gate, then the host", () => {
    expect(appearing(DRAW_PLANS.direct)).toEqual(["engineer", "gate", "host"]);
  });

  it("starts each line only once what it leaves from is there", () => {
    const edge = DRAW_PLANS.edge;
    const cdn = edge.fades.find((f) => f.key === "cdn");
    expect(strokeOf(edge, "cdn-storage").start).toBeCloseTo(cdn?.at ?? -1);
    const queue = DRAW_PLANS.queue;
    expect(strokeOf(queue, "runner-data").start).toBeCloseTo(
      strokeOf(queue, "schedule-runner").end,
    );
  });

  it("undraws in reverse: the last thing drawn is the first to go", () => {
    for (const id of STEP_ORDER) {
      const plan = DRAW_PLANS[id];
      const gone = goneAt(plan);
      for (const a of plan.fades) {
        for (const b of plan.fades) {
          // Drawn strictly earlier, gone strictly later (ties go together).
          if (a.at < b.at) {
            expect(
              gone.get(b.key),
              `${id}: ${b.key} before ${a.key}`,
            ).toBeLessThan(gone.get(a.key) ?? -1);
          }
        }
      }
    }
  });

  it("takes an icon away before its line retracts past it", () => {
    for (const id of STEP_ORDER) {
      const plan = DRAW_PLANS[id];
      for (const fade of plan.fades) {
        if (!fade.on) continue;
        const line = strokeOf(plan, fade.on.stroke);
        // Falling, the moment the line is shorter than where the icon sits,
        // the icon is already gone.
        for (const p of [...SWEEP].reverse()) {
          if (drawnAt(line, p) < fade.on.fraction - EPSILON) {
            expect(shownAt(fade, p), `${id}: ${fade.key} at ${p}`).toBe(0);
          }
        }
      }
    }
  });

  it("eases the same both ways", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.25) + ease(0.75)).toBeCloseTo(1);
  });
});
