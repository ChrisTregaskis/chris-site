import { describe, expect, it } from "vitest";
import { POSES } from "./burpeeSet";
import { CONTACT, floorFor, FRAME_PX } from "./floor";

/** Where a floor's shadow starts and ends across the frame, in its pixels. */
function span(pose: (typeof POSES)[number]) {
  const { shift, scale } = floorFor(pose);
  const centre = (0.5 + shift / 100) * FRAME_PX;
  const half = (scale * FRAME_PX) / 2;
  return [centre - half, centre + half] as const;
}

describe("the floor under the figure", () => {
  it("runs under every point where a pose meets the ground", () => {
    for (const pose of POSES) {
      const [left, right] = span(pose);
      const [from, to] = CONTACT[pose];
      expect(left, pose).toBeLessThan(from);
      expect(right, pose).toBeGreaterThan(to);
    }
  });

  it("stays inside the frame", () => {
    for (const pose of POSES) {
      const [left, right] = span(pose);
      expect(left, pose).toBeGreaterThanOrEqual(-0.01);
      expect(right, pose).toBeLessThanOrEqual(FRAME_PX + 0.01);
    }
  });

  it("is narrow under the feet and long under a plank", () => {
    expect(floorFor("stand").scale).toBeLessThan(0.5);
    expect(floorFor("plank").scale).toBeGreaterThan(0.75);
    expect(floorFor("chest").scale).toBeGreaterThan(floorFor("tuck").scale);
  });
});
