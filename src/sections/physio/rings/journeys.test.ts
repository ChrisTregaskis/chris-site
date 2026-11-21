import { describe, expect, it } from "vitest";
import { ROUTE_KEYS } from "./geometry";
import { hopsOf, journeyById, JOURNEYS, traceOf } from "./journeys";

describe("the journeys", () => {
  it("offers one per step, each opening its trace and ending on a result", () => {
    expect(JOURNEYS.map((j) => j.id)).toEqual([
      "signIn",
      "out",
      "video",
      "cross",
      "job",
      "direct",
    ]);
    for (const journey of JOURNEYS) {
      expect(journey.steps[0]?.type).toBe("log");
      expect(journey.steps.at(-1)?.type).toBe("result");
    }
  });

  it("travels only real routes, and comes home by the way it went", () => {
    for (const journey of JOURNEYS) {
      const open: string[] = [];
      for (const hop of hopsOf(journey)) {
        const [route, back] = hop.split(" ");
        expect(ROUTE_KEYS).toContain(route);
        if (back) {
          expect(open.pop(), `${journey.id}: ${hop}`).toBe(route);
        } else {
          open.push(route);
        }
      }
      expect(open, journey.id).toEqual([]);
    }
  });

  it("turns another organisation's read away at the policy, never reaching the data", () => {
    const cross = journeyById("cross");
    const hops = hopsOf(cross);
    expect(hops).toContain("fn-policy");
    expect(hops).not.toContain("fn-data");
    expect(cross.steps).toContainEqual({ type: "block", node: "policy" });
    expect(cross.steps.at(-1)).toEqual({
      type: "result",
      text: "No sessions",
      held: true,
    });
  });

  it("finds no way out of the network", () => {
    const out = journeyById("out");
    expect(hopsOf(out)).toEqual(["fn-noRoute", "fn-noRoute back"]);
    expect(out.steps).toContainEqual({ type: "block", node: "noRoute" });
    expect(out.steps.at(-1)).toMatchObject({ type: "result", held: true });
  });

  it("lets an engineer read the database directly, and refuses the write", () => {
    const direct = journeyById("direct");
    expect(direct.steps).toContainEqual({ type: "block", node: "data" });
    expect(traceOf(direct).map((line) => line.text)).toContain(
      "refused: this login can't write",
    );
  });

  it("queues the job with the answers, then a runner claims and finishes it", () => {
    const job = journeyById("job");
    const tokens = job.steps.flatMap((step) =>
      step.type === "token" ? [step.state] : [],
    );
    expect(tokens).toEqual(["queued", "claimed", "done"]);
    const hops = hopsOf(job);
    // The visitor is home before the runner ever sets off.
    expect(hops.indexOf("visitor-api back")).toBeLessThan(
      hops.indexOf("schedule-runner"),
    );
  });

  it("keeps the trace to the column and free of connector dashes", () => {
    for (const journey of JOURNEYS) {
      for (const line of traceOf(journey)) {
        expect(line.who.length).toBeLessThanOrEqual(8);
        expect(line.text).not.toMatch(/[\u2013\u2014]/);
      }
      expect(journey.label).not.toMatch(/[\u2013\u2014]/);
    }
  });
});
