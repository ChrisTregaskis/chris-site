import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRememberedFlag } from "./useRememberedFlag";

const KEY = "ct:test-flag:v1";

describe("useRememberedFlag", () => {
  it("is not remembered on a first visit", () => {
    const { result } = renderHook(() => useRememberedFlag(KEY));
    expect(result.current.remembered).toBe(false);
  });

  it("is remembered when the flag is already stored", () => {
    localStorage.setItem(KEY, JSON.stringify({ at: "2026-11-01T09:30:00Z" }));
    const { result } = renderHook(() => useRememberedFlag(KEY));
    expect(result.current.remembered).toBe(true);
  });

  it("stores the flag for next time without changing this visit", () => {
    const { result } = renderHook(() => useRememberedFlag(KEY));
    act(() => result.current.remember());

    expect(result.current.remembered).toBe(false);
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}") as {
      at?: unknown;
    };
    expect(Object.keys(stored)).toEqual(["at"]);
    expect(typeof stored.at).toBe("string");
    expect(
      renderHook(() => useRememberedFlag(KEY)).result.current.remembered,
    ).toBe(true);
  });

  it("dismisses the flag for this visit only, keeping it stored", () => {
    const value = JSON.stringify({ at: "2026-11-01T09:30:00Z" });
    localStorage.setItem(KEY, value);
    const { result } = renderHook(() => useRememberedFlag(KEY));
    act(() => result.current.dismiss());

    expect(result.current.remembered).toBe(false);
    expect(localStorage.getItem(KEY)).toBe(value);
    expect(
      renderHook(() => useRememberedFlag(KEY)).result.current.remembered,
    ).toBe(true);
  });

  it("falls back to not remembered when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const { result } = renderHook(() => useRememberedFlag(KEY));

    expect(result.current.remembered).toBe(false);
    expect(() => act(() => result.current.remember())).not.toThrow();
  });
});
