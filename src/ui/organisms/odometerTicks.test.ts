import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { odometerNext, odometerTickMs } from "./odometerTicks";
import { useOdometer } from "./useOdometer";

describe("odometer", () => {
  it("ticks faster the further it has to go, within 55 to 90ms", () => {
    expect(odometerTickMs(1)).toBe(90);
    expect(odometerTickMs(6)).toBe(80);
    expect(odometerTickMs(9)).toBe(55);
    expect(odometerTickMs(0)).toBe(90);
  });

  it("steps one number at a time towards the target, either way", () => {
    expect(odometerNext(1, 4)).toBe(2);
    expect(odometerNext(7, 3)).toBe(6);
    expect(odometerNext(5, 5)).toBe(5);
  });

  it("rolls through every number between, starting at once", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ target }) => useOdometer(target, false),
      { initialProps: { target: 1 } },
    );
    const seen = [result.current.shown];

    rerender({ target: 4 });
    seen.push(result.current.shown);
    expect(result.current.direction).toBe(1);
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(result.current.tickMs || 1);
      });
      if (seen.at(-1) !== result.current.shown) seen.push(result.current.shown);
    }
    expect(seen).toEqual([1, 2, 3, 4]);
  });

  it("picks up a new target mid-roll and reverses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ target }) => useOdometer(target, false),
      { initialProps: { target: 1 } },
    );
    rerender({ target: 5 });
    act(() => {
      vi.advanceTimersByTime(result.current.tickMs);
    });
    expect(result.current.shown).toBe(3);

    rerender({ target: 1 });
    act(() => {
      vi.advanceTimersByTime(result.current.tickMs);
    });
    expect(result.current.shown).toBe(2);
    expect(result.current.direction).toBe(-1);
  });

  it("jumps straight to the target under reduced motion", () => {
    const { result, rerender } = renderHook(
      ({ target }) => useOdometer(target, true),
      { initialProps: { target: 1 } },
    );
    rerender({ target: 9 });
    expect(result.current.shown).toBe(9);
  });
});
