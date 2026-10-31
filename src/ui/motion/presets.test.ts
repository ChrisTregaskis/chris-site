import { describe, expect, it } from "vitest";
import {
  type MotionPresetName,
  resolvePreset,
  staggerChildren,
} from "./presets";
import { DURATION, EASE, STAGGER } from "@/ui/tokens/motion";

const NAMES: MotionPresetName[] = [
  "fade",
  "fadeUp",
  "lift",
  "enterFromRight",
  "enterFromBelow",
];

const TRANSFORMS = ["x", "y", "scale"];

describe("motion presets", () => {
  it("fadeUp moves and fades with the enter tokens", () => {
    const preset = resolvePreset("fadeUp", false);
    expect(preset.initial).toEqual({ opacity: 0, y: 16 });
    expect(preset.animate).toEqual({ opacity: 1, y: 0 });
    expect(preset.transition).toMatchObject({
      duration: DURATION.enter,
      ease: EASE.enter,
    });
  });

  it("uses the b3 offsets for the drawer, the sheet and the lift", () => {
    expect(resolvePreset("enterFromRight", false).initial).toMatchObject({
      x: 40,
    });
    expect(resolvePreset("enterFromBelow", false).initial).toMatchObject({
      y: 40,
    });
    const lift = resolvePreset("lift", false);
    expect(lift.animate).toMatchObject({ y: -22 });
    expect(lift.transition).toMatchObject({
      duration: DURATION.slow,
      ease: EASE.lift,
    });
  });

  it("every preset drops transforms and duration under reduced motion", () => {
    for (const name of NAMES) {
      const preset = resolvePreset(name, true);
      for (const target of [preset.initial, preset.animate, preset.exit]) {
        for (const key of TRANSFORMS) {
          expect(target, `${name} ${key}`).not.toHaveProperty(key);
        }
      }
      expect(preset.transition.duration, name).toBe(0);
    }
  });

  it("stagger collapses to zero under reduced motion", () => {
    expect(staggerChildren("base", false)).toEqual({
      staggerChildren: STAGGER.base,
    });
    expect(staggerChildren("loose", true)).toEqual({ staggerChildren: 0 });
  });
});
