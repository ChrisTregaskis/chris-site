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
