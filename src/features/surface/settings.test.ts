import { describe, expect, it } from "vitest";
import { SURFACE_DEFAULTS, effectiveMesh } from "./settings";

describe("the surface's production defaults", () => {
  it("are the chapter tones; the pencil mesh with the pointer at the page's ends, Medium, stepping back behind text; the drawers on paper with the mesh, Clear", () => {
    expect(SURFACE_DEFAULTS).toEqual({
      tones: true,
      mesh: "pointer",
      lines: true,
      reach: "ends",
      strength: "medium",
      protect: true,
      drawer: "mesh",
      drawerStrength: "clear",
    });
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
