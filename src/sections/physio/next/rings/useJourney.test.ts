import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useJourney } from "./useJourney";

/** Animation frames held until a test lets them run. */
let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  frames = [];
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  // Unmount while the frame stubs are still in place (jsdom has none).
  cleanup();
  vi.useRealTimers();
});

/** Lets the held frames run, far enough on that every leg finishes. */
function runFrames() {
  const pending = frames;
  frames = [];
  pending.forEach((callback) => callback(performance.now() + 60_000));
}

const empty = (set: ReadonlySet<unknown>) => set.size === 0;

describe("a journey's runner", () => {
  it("lights its route and nodes as it goes", () => {
    const { result } = renderHook(() => useJourney(false));
    act(() => {
      void result.current.run("cross");
    });
    expect(result.current.running).toBe("cross");
    expect([...result.current.lit]).toEqual(["visitor-api"]);
    expect(result.current.hot.has("visitor")).toBe(true);
    expect(result.current.trace[0]?.who).toBe("visitor");
  });

  it("cancels mid-route and clears everything it lit, for good", async () => {
    const { result } = renderHook(() => useJourney(false));
    act(() => {
      void result.current.run("job");
    });
    expect(empty(result.current.lit)).toBe(false);

    act(() => result.current.cancel());
    expect(result.current.running).toBeNull();
    expect(empty(result.current.lit)).toBe(true);
    expect(empty(result.current.hot)).toBe(true);
    expect(empty(result.current.held)).toBe(true);
    expect(result.current.token).toBeNull();
    expect(result.current.trace).toEqual([]);
    expect(result.current.result).toBeNull();

    // Nothing left in flight lights anything again: frames, beats, flashes.
    await act(async () => {
      runFrames();
      await vi.runAllTimersAsync();
      runFrames();
    });
    expect(empty(result.current.lit)).toBe(true);
    expect(empty(result.current.hot)).toBe(true);
    expect(result.current.trace).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels the journey running when another starts", () => {
    const { result } = renderHook(() => useJourney(false));
    act(() => {
      void result.current.run("job");
    });
    act(() => {
      void result.current.run("signIn");
    });
    expect(result.current.running).toBe("signIn");
    expect(result.current.trace.map((line) => line.text)).toEqual([
      "signs in as a member of Acme",
    ]);
    expect([...result.current.lit]).toEqual(["visitor-signIn"]);
    expect(result.current.token).toBeNull();
  });

  it("leaves no timer behind when it unmounts mid-journey", () => {
    const { result, unmount } = renderHook(() => useJourney(false));
    act(() => {
      void result.current.run("direct");
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
