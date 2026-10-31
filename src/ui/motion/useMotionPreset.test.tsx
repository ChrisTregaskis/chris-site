import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { resolvePreset } from "./presets";
import { useMotionPreset } from "./useMotionPreset";

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

describe("useMotionPreset", () => {
  it("returns the reduced preset when the visitor prefers reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() => useMotionPreset("fadeUp"));
    expect(result.current).toEqual(resolvePreset("fadeUp", true));
  });

  it("falls back to full motion when the preference is unknown", () => {
    vi.mocked(useReducedMotion).mockReturnValue(null);
    const { result } = renderHook(() => useMotionPreset("fadeUp"));
    expect(result.current).toEqual(resolvePreset("fadeUp", false));
  });
});
