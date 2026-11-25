import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { phoneStageSettings, useCompactStage } from "./phoneStageSettings";

function media(stacked: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: stacked && query.includes("max-width"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

describe("the phone stage", () => {
  afterEach(() => {
    act(() => phoneStageSettings.set({ phoneStage: "compact" }));
  });

  it("starts compact, as the page ships it", () => {
    expect(phoneStageSettings.defaults.phoneStage).toBe("compact");
  });

  it("is compact only when stacked, and only while compact is chosen", () => {
    media(true);
    const { result } = renderHook(() => useCompactStage());
    expect(result.current).toBe(true);
    act(() => phoneStageSettings.set({ phoneStage: "current" }));
    expect(result.current).toBe(false);
  });

  it("leaves the side-by-side layout alone", () => {
    media(false);
    const { result } = renderHook(() => useCompactStage());
    expect(result.current).toBe(false);
  });
});
