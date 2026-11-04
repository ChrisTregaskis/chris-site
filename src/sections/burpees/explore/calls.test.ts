import { describe, expect, it } from "vitest";
import { CALL_AT, CALLS, callAt, repsAt, SET_REPS } from "./calls";

describe("the called set", () => {
  it("lands each call on its own rep count", () => {
    CALL_AT.forEach((at, index) => {
      expect(repsAt(at)).toBe(CALLS[index].at);
      expect(callAt(at)).toBe(index);
    });
  });

  it("only ever counts up, from 0 to the whole set", () => {
    let last = -1;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const reps = repsAt(p);
      expect(reps).toBeGreaterThanOrEqual(last);
      last = reps;
    }
    expect(repsAt(0)).toBe(0);
    expect(repsAt(1)).toBe(SET_REPS);
  });

  it("never names a milestone before its count", () => {
    for (let p = 0; p <= 1; p += 0.005) {
      expect(repsAt(p)).toBeGreaterThanOrEqual(CALLS[callAt(p)].at);
    }
  });

  it("keeps the app's words for its calls", () => {
    expect(CALLS.map((c) => c.call)).toEqual([
      "Go!",
      "Ten.",
      "Halfway",
      "Five left",
      "Last one",
      "Done",
    ]);
  });
});
