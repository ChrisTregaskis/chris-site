import { describe, expect, it } from "vitest";
import {
  SURFACE_DEFAULTS,
  effectiveMesh,
  parseSurfaceParams,
  withSurfaceParams,
} from "./settings";

describe("surface settings from the URL", () => {
  it("reads tones, mesh and lines", () => {
    expect(
      parseSurfaceParams("?tones=0&mesh=pointer&lines=1", SURFACE_DEFAULTS),
    ).toEqual({ tones: false, mesh: "pointer", lines: true });
    expect(
      parseSurfaceParams("?tones=on&mesh=static", SURFACE_DEFAULTS),
    ).toEqual({ ...SURFACE_DEFAULTS, tones: true, mesh: "static" });
  });

  it("keeps the fallback for anything missing or unreadable", () => {
    expect(parseSurfaceParams("", SURFACE_DEFAULTS)).toEqual(SURFACE_DEFAULTS);
    expect(
      parseSurfaceParams("?tones=maybe&mesh=wobbly", SURFACE_DEFAULTS),
    ).toEqual(SURFACE_DEFAULTS);
  });

  it("writes them back, keeping the other parameters, and reads back the same", () => {
    const settings = { tones: false, mesh: "static", lines: true } as const;
    const search = withSurfaceParams("?utm=x", settings);
    expect(search).toContain("utm=x");
    expect(parseSurfaceParams(search, SURFACE_DEFAULTS)).toEqual(settings);
  });
});

describe("the mesh a visitor gets", () => {
  it("follows the pointer only with a mouse and motion allowed", () => {
    const mouse = { finePointer: true, reducedMotion: false };
    expect(effectiveMesh("pointer", mouse)).toBe("pointer");
    expect(effectiveMesh("pointer", { ...mouse, finePointer: false })).toBe(
      "static",
    );
    expect(effectiveMesh("pointer", { ...mouse, reducedMotion: true })).toBe(
      "static",
    );
    expect(effectiveMesh("static", mouse)).toBe("static");
    expect(effectiveMesh("off", mouse)).toBe("off");
  });
});
