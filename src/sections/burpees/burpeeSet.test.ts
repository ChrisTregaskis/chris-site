import { describe, expect, it } from "vitest";
import { POSES, SEAL, STILL_POSE } from "./burpeeSet";

describe("Badass Burpees set", () => {
  it("plays the Navy SEAL rep: ten counted beats between standing poses", () => {
    expect(SEAL.map(([, beat]) => beat).filter(Boolean)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(SEAL.at(-1)?.[0]).toBe("stand");
  });

  it("draws every pose the rep uses, and holds a knee drive when still", () => {
    for (const [pose] of SEAL) expect(POSES).toContain(pose);
    expect(STILL_POSE).toBe("plank-l-knee");
  });
});
