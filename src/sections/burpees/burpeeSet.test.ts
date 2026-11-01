import { describe, expect, it } from "vitest";
import { RING_LENGTH, SEAL, setReadout } from "./burpeeSet";

describe("Badass Burpees set", () => {
  it("counts a 100-rep, 20-minute set as you scroll through it", () => {
    expect(setReadout(0)).toEqual({
      reps: 0,
      ringOffset: RING_LENGTH,
      clock: "One every 12.0s, 20:00 left",
    });
    expect(setReadout(0.5)).toMatchObject({
      reps: 50,
      clock: "One every 12.0s, 10:00 left",
    });
    expect(setReadout(1)).toEqual({
      reps: 100,
      ringOffset: 0,
      clock: "One every 12.0s, 00:00 left",
    });
  });

  it("plays the Navy SEAL rep: ten counted beats between standing poses", () => {
    expect(SEAL.map(([, beat]) => beat).filter(Boolean)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(SEAL.at(-1)?.[0]).toBe("stand");
  });
});
