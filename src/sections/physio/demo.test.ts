import { describe, expect, it } from "vitest";
import {
  DEMO,
  type DemoAction,
  demoReducer,
  type DemoState,
  INITIAL_DEMO,
  nextDemoEvent,
  nextOrg,
} from "./demo";

/** Runs the demo on its own for `ms`, as the hook's timer would; returns each state it settles in. */
function play(from: DemoState, ms: number) {
  let state = from;
  let clock = 0;
  const seen: { at: number; state: DemoState }[] = [];
  for (;;) {
    const { delay, action } = nextDemoEvent(state);
    if (clock + delay > ms) break;
    clock += delay;
    state = demoReducer(state, action);
    seen.push({ at: clock, state });
  }
  return { state, seen, clock };
}

const summary = ({ leak, pressing }: DemoState) =>
  pressing
    ? `press ${pressing.kind === "pick" ? pressing.org : pressing.kind}`
    : `${leak.signedIn} ${leak.ask === "other" ? "empty" : "result"}`;

const visitor = (action: DemoAction & { type: "visitor" }) => action;

describe("the leak test's demo", () => {
  it("presses each button before it acts, cycling through every organisation", () => {
    const { seen } = play(INITIAL_DEMO, 60_000);
    expect(seen.map(({ state }) => summary(state)).slice(0, 18)).toEqual([
      "press try",
      "Alder empty",
      "press reset",
      "Alder result",
      "press Birch",
      "Birch result",
      "press try",
      "Birch empty",
      "press reset",
      "Birch result",
      "press Cedar",
      "Cedar result",
      "press try",
      "Cedar empty",
      "press reset",
      "Cedar result",
      "press Alder",
      "Alder result",
    ]);
  });

  it("holds a result about three seconds and an empty result long enough to read", () => {
    const tried = play(INITIAL_DEMO, DEMO.hold + DEMO.press).state;
    expect(summary(tried)).toBe("Alder empty");
    expect(nextDemoEvent(tried).delay).toBe(DEMO.empty);
    expect(DEMO.hold).toBeGreaterThanOrEqual(2500);
    expect(DEMO.hold).toBeLessThanOrEqual(4000);
    expect(DEMO.empty).toBeGreaterThan(DEMO.hold);
    expect(nextDemoEvent(INITIAL_DEMO).delay).toBe(DEMO.hold);
  });

  it("lets the visitor's move win at once, even mid-press, then waits ten seconds", () => {
    const pressing = demoReducer(INITIAL_DEMO, {
      type: "press",
      move: { kind: "try" },
    });
    const picked = demoReducer(
      pressing,
      visitor({ type: "visitor", action: { type: "pick", org: "Cedar" } }),
    );
    expect(picked.pressing).toBeNull();
    expect(picked.leak).toMatchObject({ signedIn: "Cedar", ask: "every" });
    expect(picked.by).toBe("visitor");
    const next = nextDemoEvent(picked);
    expect(next.delay).toBe(DEMO.idle);
    // It picks up from where the visitor left it: Cedar signed in, so try.
    expect(next.action).toEqual({ type: "press", move: { kind: "try" } });
  });

  it("picks up from an empty result the visitor left by clearing it", () => {
    const tried = demoReducer(
      INITIAL_DEMO,
      visitor({ type: "visitor", action: { type: "try" } }),
    );
    expect(nextDemoEvent(tried)).toEqual({
      delay: DEMO.idle,
      action: { type: "press", move: { kind: "reset" } },
    });
  });

  it("moves to the next organisation after a reset, the visitor's or its own", () => {
    const reset = demoReducer(
      demoReducer(
        INITIAL_DEMO,
        visitor({ type: "visitor", action: { type: "try" } }),
      ),
      visitor({ type: "visitor", action: { type: "reset" } }),
    );
    expect(nextDemoEvent(reset).action).toEqual({
      type: "press",
      move: { kind: "pick", org: "Birch" },
    });
    expect(nextOrg("Cedar")).toBe("Alder");
  });

  it("pausing drops a press in progress; playing resumes at its own pace", () => {
    const pressing = demoReducer(INITIAL_DEMO, {
      type: "press",
      move: { kind: "try" },
    });
    const paused = demoReducer(pressing, { type: "pause" });
    expect(paused).toMatchObject({ paused: true, pressing: null });
    const tried = demoReducer(
      paused,
      visitor({ type: "visitor", action: { type: "try" } }),
    );
    const playing = demoReducer(tried, { type: "play" });
    expect(playing.paused).toBe(false);
    expect(nextDemoEvent(playing).delay).toBe(DEMO.empty);
  });

  it("counts each try, so every attempt replays", () => {
    const { state } = play(INITIAL_DEMO, 40_000);
    expect(state.leak.attempt).toBeGreaterThanOrEqual(3);
  });
});
