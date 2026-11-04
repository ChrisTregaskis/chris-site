import { describe, expect, it } from "vitest";
import {
  DEMO_STEP,
  INTRO_STEP,
  numeralForStep,
  PART_ORDER,
  partForStep,
  partNumber,
  PICKER_OPTIONS,
  stepForPart,
} from "./parts";

describe("the Wayfinder story's steps", () => {
  it("opens on the board taken apart, walks the nine parts, then the demo", () => {
    expect(INTRO_STEP).toBe(1);
    expect(DEMO_STEP).toBe(11);
    expect(partForStep(0)).toBeNull();
    expect(partForStep(INTRO_STEP)).toBeNull();
    expect(partForStep(DEMO_STEP)).toBeNull();
    PART_ORDER.forEach((id, index) => {
      expect(stepForPart(id)).toBe(index + 2);
      expect(partForStep(index + 2)).toBe(id);
      expect(partNumber(id)).toBe(index + 1);
    });
  });

  it("numbers the steps 00 to 10, so every part keeps its own number", () => {
    expect(numeralForStep(INTRO_STEP)).toBe(0);
    for (const id of PART_ORDER) {
      expect(numeralForStep(stepForPart(id))).toBe(partNumber(id));
    }
    expect(numeralForStep(DEMO_STEP)).toBe(10);
  });

  it("offers every step in the picker, by its numeral, with the parts set apart", () => {
    expect(PICKER_OPTIONS.map((option) => option.value)).toEqual(
      Array.from({ length: DEMO_STEP }, (_, k) => k + 1),
    );
    expect(PICKER_OPTIONS.map((option) => option.numeral)).toEqual(
      Array.from({ length: DEMO_STEP }, (_, k) => k),
    );
    expect(PICKER_OPTIONS[0].label).toBe("Taken apart");
    expect(PICKER_OPTIONS[1]).toEqual(
      expect.objectContaining({ separated: true }),
    );
    expect(PICKER_OPTIONS.at(-1)).toEqual(
      expect.objectContaining({ separated: true }),
    );
  });
});
