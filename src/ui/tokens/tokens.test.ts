// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DURATION, EASE, STAGGER } from "./motion";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

const cssVars = (prefix: string) =>
  Object.fromEntries(
    [
      ...css.matchAll(new RegExp(`--${prefix}-([a-z-]+):\\s*([^;]+);`, "g")),
    ].map((match) => [match[1], match[2].trim()]),
  );

describe("motion tokens", () => {
  it("keeps motion.ts in step with tokens.css", () => {
    const durations = cssVars("duration");
    const eases = cssVars("ease");

    expect(Object.keys(durations).sort()).toEqual(Object.keys(DURATION).sort());
    expect(Object.keys(eases).sort()).toEqual(Object.keys(EASE).sort());

    for (const [name, seconds] of Object.entries(DURATION)) {
      expect(durations[name]).toBe(`${Math.round(seconds * 1000)}ms`);
    }

    const staggers = cssVars("stagger");
    expect(Object.keys(staggers).sort()).toEqual(Object.keys(STAGGER).sort());
    for (const [name, seconds] of Object.entries(STAGGER)) {
      expect(staggers[name]).toBe(`${Math.round(seconds * 1000)}ms`);
    }
    for (const [name, curve] of Object.entries(EASE)) {
      const numbers = /cubic-bezier\(([^)]+)\)/
        .exec(eases[name])?.[1]
        .split(",")
        .map(Number);
      expect(numbers).toEqual([...curve]);
    }
  });
});

/** WCAG contrast between two `--color-*` tokens (RGB channel triplets). */
function contrast(a: string, b: string): number {
  const colours = cssVars("color");
  const luminance = (name: string) => {
    const [r, g, bl] = colours[name].split(/\s+/).map((channel) => {
      const v = Number(channel) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("colour tokens", () => {
  it("keeps a dimmed step card's text at AA (4.5:1) on the card", () => {
    // The dimmed card is panel at 45% over surface: between the two.
    for (const text of ["dim-ink", "dim-muted"]) {
      expect(contrast(text, "panel"), text).toBeGreaterThanOrEqual(4.5);
      expect(contrast(text, "surface"), text).toBeGreaterThanOrEqual(4.5);
    }
    // Chips and badges keep their raised fill.
    expect(contrast("dim-ink", "raised")).toBeGreaterThanOrEqual(4.5);
  });

  it("draws form field borders at 3:1 against the drawer and the field", () => {
    expect(contrast("line-field", "panel")).toBeGreaterThanOrEqual(3);
    expect(contrast("line-field", "surface")).toBeGreaterThanOrEqual(3);
  });
});
