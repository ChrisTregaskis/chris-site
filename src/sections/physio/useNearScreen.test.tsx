import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNearScreen } from "./useNearScreen";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function fakeObserver() {
  const seen: { callback: Callback; margin?: string }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        seen.push({ callback, margin: options?.rootMargin });
      }
      observe() {}
      disconnect() {}
    },
  );
  return {
    margin: () => seen.at(-1)?.margin,
    report: (isIntersecting: boolean) =>
      act(() => seen.at(-1)?.callback([{ isIntersecting }])),
  };
}

const ref = { current: document.createElement("div") };

describe("useNearScreen", () => {
  it("waits until the figure is within a screen and a half, then stays drawn", () => {
    const observer = fakeObserver();
    const { result } = renderHook(() => useNearScreen(ref, false));
    expect(result.current).toBe(false);
    expect(observer.margin()).toBe("150% 0px 150% 0px");
    observer.report(false);
    expect(result.current).toBe(false);
    observer.report(true);
    expect(result.current).toBe(true);
  });

  it("draws at once on the static page", () => {
    fakeObserver();
    const { result } = renderHook(() => useNearScreen(ref, true));
    expect(result.current).toBe(true);
  });
});
