import { describe, expect, it } from "vitest";
import { smoothstep } from "./portraitMaths";

describe("smoothstep", () => {
  it("holds at 0 before the range and 1 after it", () => {
    expect(smoothstep(0.2, 0.4, 0)).toBe(0);
    expect(smoothstep(0.2, 0.4, 0.2)).toBe(0);
    expect(smoothstep(0.2, 0.4, 0.4)).toBe(1);
    expect(smoothstep(0.2, 0.4, 1)).toBe(1);
  });

  it("is halfway at the middle and eased either side", () => {
    expect(smoothstep(0.2, 0.4, 0.3)).toBeCloseTo(0.5);
    expect(smoothstep(0, 1, 0.25)).toBeCloseTo(0.15625);
  });
});
