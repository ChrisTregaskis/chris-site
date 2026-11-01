import { describe, expect, it } from "vitest";
import {
  milestonesPassed,
  pinTopFor,
  runwayProgress,
  stickyProgress,
  viewportProgress,
} from "./scrollProgress";

describe("scroll progress", () => {
  it("runs from 0 to 1 over a pinned runway", () => {
    expect(runwayProgress(300, 200, 400)).toBe(0);
    expect(runwayProgress(0, 200, 400)).toBe(0.5);
    expect(runwayProgress(-500, 200, 400)).toBe(1);
    expect(runwayProgress(0, 200, 0)).toBe(1);
  });

  it("runs from 0 to 1 while a tall section's content sticks", () => {
    // 2000 tall in a 1000 viewport: 1000px of travel.
    expect(stickyProgress(0, 2000, 1000)).toBe(0);
    expect(stickyProgress(-500, 2000, 1000)).toBe(0.5);
    expect(stickyProgress(-1200, 2000, 1000)).toBe(1);
    // Sticking under a 68px bar.
    expect(stickyProgress(68, 2000, 1000, 68)).toBe(0);
    expect(stickyProgress(68 - 1068, 2000, 1000, 68)).toBe(1);
  });

  it("lights each milestone a fifth of the way into its share", () => {
    expect(milestonesPassed(0, 5)).toBe(0);
    expect(milestonesPassed(0.04, 5)).toBe(1);
    expect(milestonesPassed(0.5, 5)).toBe(3);
    expect(milestonesPassed(0.84, 5)).toBe(5);
  });

  it("tracks an element across the viewport", () => {
    expect(viewportProgress(1000, 400, 1000)).toBe(0);
    expect(viewportProgress(300, 400, 1000)).toBe(0.5);
    expect(viewportProgress(-400, 400, 1000)).toBe(1);
  });

  it("pins a panel centred, clear of the sticky bar, and keeps a tall one's bottom in view", () => {
    // Room to spare: centred (b3).
    expect(pinTopFor(900, 358, 68)).toBe(271);
    // A short phone: centring would tuck the heading under the 68px bar.
    expect(pinTopFor(667, 525, 68)).toBe(84);
    // Taller than the room under the bar: bottom 16px above the viewport's bottom.
    expect(pinTopFor(568, 576, 68)).toBe(-24);
    // No bar: centred, as before.
    expect(pinTopFor(600, 500)).toBe(50);
  });
});
