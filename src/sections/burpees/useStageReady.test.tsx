import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStageReady } from "./useStageReady";

const room = () => ({ current: document.createElement("div") });

describe("useStageReady", () => {
  it("fetches the stage's code a moment after the page has loaded, without drawing it yet", () => {
    vi.useFakeTimers();
    const load = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useStageReady(room(), load, false));
    expect(load).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(load).toHaveBeenCalledTimes(1);
    // Drawn only as the visitor nears it.
    expect(result.current).toBe(false);
  });

  it("draws at once on the static page", () => {
    const load = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useStageReady(room(), load, true));
    expect(result.current).toBe(true);
  });
});
