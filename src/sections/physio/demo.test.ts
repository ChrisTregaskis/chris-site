import { describe, expect, it } from "vitest";
import {
  INITIAL_LOOP,
  LOOP,
  type LoopAction,
  loopReducer,
  type LoopState,
  nextLoopEvent,
  nextOrg,
} from "./demo";

/** Runs the loop on its own for `ms`, as the hook's timer would while it's on; returns each state it settles in. */
function play(from: LoopState, ms: number) {
  let state = from;
  let clock = 0;
  const seen: { at: number; state: LoopState }[] = [];
  while (state.looping) {
    const { delay, action } = nextLoopEvent(state);
    if (clock + delay > ms) break;
    clock += delay;
    state = loopReducer(state, action);
    seen.push({ at: clock, state });
  }
  return { state, seen, clock };
}

const summary = ({ leak, pressing }: LoopState) =>
  pressing
    ? `press ${pressing.kind === "pick" ? pressing.org : pressing.kind}`
    : `${leak.signedIn} ${leak.ask === "other" ? "empty" : "result"}`;

const visitor = (action: LoopAction & { type: "visitor" }) => action;

const started = loopReducer(INITIAL_LOOP, { type: "start" });

describe("the leak test's example loop", () => {
  it("is off until the visitor turns it on", () => {
    expect(INITIAL_LOOP.looping).toBe(false);
    expect(play(INITIAL_LOOP, 60_000).seen).toEqual([]);
    // Nothing the loop would do on its own lands while it's off.
    expect(
      loopReducer(INITIAL_LOOP, { type: "press", move: { kind: "try" } }),
    ).toBe(INITIAL_LOOP);
    expect(loopReducer(INITIAL_LOOP, { type: "act" })).toBe(INITIAL_LOOP);
  });

  it("presses its first button at once when turned on, then each button before it acts, through every organisation", () => {
    expect(started).toMatchObject({ looping: true, pressing: { kind: "try" } });
    const { seen } = play(started, 60_000);
    expect(
      [started, ...seen.map(({ state }) => state)].map(summary).slice(0, 18),
    ).toEqual([
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
    expect(nextLoopEvent(started).delay).toBe(LOOP.press);
    const tried = play(started, LOOP.press).state;
    expect(summary(tried)).toBe("Alder empty");
    expect(nextLoopEvent(tried).delay).toBe(LOOP.empty);
    const reset = loopReducer(
      loopReducer(tried, { type: "press", move: { kind: "reset" } }),
      { type: "act" },
    );
    expect(nextLoopEvent(reset).delay).toBe(LOOP.hold);
    expect(LOOP.hold).toBeGreaterThanOrEqual(2500);
    expect(LOOP.hold).toBeLessThanOrEqual(4000);
    expect(LOOP.empty).toBeGreaterThan(LOOP.hold);
  });

  it("stops for good when the visitor uses a button, even mid-press, showing what they asked for", () => {
    const picked = loopReducer(
      started,
      visitor({ type: "visitor", action: { type: "pick", org: "Cedar" } }),
    );
    expect(picked).toMatchObject({
      looping: false,
      pressing: null,
      by: "visitor",
      leak: { signedIn: "Cedar", ask: "every" },
    });
    // It never picks up again by itself.
    expect(play(picked, 600_000).seen).toEqual([]);
  });

  it("stops when turned off or scrolled away, dropping a press in progress", () => {
    const stopped = loopReducer(started, { type: "stop" });
    expect(stopped).toMatchObject({ looping: false, pressing: null });
    expect(stopped.leak).toEqual(started.leak);
    expect(loopReducer(stopped, { type: "stop" })).toBe(stopped);
  });

  it("starts again from where things are: clearing an empty result, or moving on after a reset", () => {
    const tried = loopReducer(
      INITIAL_LOOP,
      visitor({ type: "visitor", action: { type: "try" } }),
    );
    expect(loopReducer(tried, { type: "start" }).pressing).toEqual({
      kind: "reset",
    });
    const reset = loopReducer(
      tried,
      visitor({ type: "visitor", action: { type: "reset" } }),
    );
    expect(loopReducer(reset, { type: "start" }).pressing).toEqual({
      kind: "pick",
      org: "Birch",
    });
    expect(nextOrg("Cedar")).toBe("Alder");
    // Turning it on again while it's on changes nothing.
    expect(loopReducer(started, { type: "start" })).toBe(started);
  });

  it("counts each try, so every attempt replays", () => {
    const { state } = play(started, 40_000);
    expect(state.leak.attempt).toBeGreaterThanOrEqual(3);
  });
});
