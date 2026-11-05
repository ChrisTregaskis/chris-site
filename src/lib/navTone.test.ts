import { describe, expect, it } from "vitest";
import { featherPx, parseRgb, toneAt } from "./navTone";

describe("parseRgb", () => {
  it("reads a tone token's channels", () => {
    expect(parseRgb(" 25 27 66")).toEqual([25, 27, 66]);
    expect(parseRgb("25, 27, 66")).toEqual([25, 27, 66]);
  });

  it("refuses anything that isn't three numbers", () => {
    expect(parseRgb("")).toBeNull();
    expect(parseRgb("var(--x)")).toBeNull();
    expect(parseRgb("1 2")).toBeNull();
  });
});

describe("featherPx", () => {
  it("reads px, vh and a share of the chapter's height", () => {
    expect(featherPx("160px", 2000, 800)).toBe(160);
    expect(featherPx("70vh", 2000, 800)).toBe(560);
    expect(featherPx("100%", 2000, 800)).toBe(2000);
  });

  it("falls back to 360px when unset or unreadable", () => {
    expect(featherPx("", 2000, 800)).toBe(360);
    expect(featherPx("calc(1px + 2px)", 2000, 800)).toBe(360);
  });
});

describe("toneAt", () => {
  const from = [19, 20, 46] as const;
  const to = [25, 27, 66] as const;

  it("starts on the tone before and ends on the chapter's own", () => {
    expect(toneAt(from, to, 360, 0)).toEqual(from);
    expect(toneAt(from, to, 360, 360)).toEqual(to);
    expect(toneAt(from, to, 360, 5000)).toEqual(to);
  });

  it("eases linearly through the feather", () => {
    expect(toneAt(from, to, 360, 180)).toEqual([22, 24, 56]);
  });

  it("clamps above the chapter and survives a zero feather", () => {
    expect(toneAt(from, to, 360, -50)).toEqual(from);
    expect(toneAt(from, to, 0, 0)).toEqual(to);
  });
});
