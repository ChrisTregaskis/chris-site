import { act, renderHook } from "@testing-library/react";
import { type FocusEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO } from "./demo";
import { useLeakTest } from "./useLeakTest";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let onScreen: (visible: boolean) => void = () => {};

// An observer the test reports through by hand.
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private callback: Callback;
      constructor(callback: Callback) {
        this.callback = callback;
      }
      observe() {
        onScreen = (visible) => {
          act(() => this.callback([{ isIntersecting: visible }]));
        };
      }
      disconnect() {}
    },
  );
});

const watch = { current: document.createElement("div") };

/** The hook in the last step, its figure on screen. */
function setup(stage = 3, still = false) {
  const hook = renderHook(
    ({ stage: s, still: st }) => useLeakTest(s, { still: st, watch }),
    { initialProps: { stage, still } },
  );
  onScreen(true);
  return hook;
}

/** Lets time pass, one timer at a time: each move schedules the next only once React has rendered it. */
const advance = (...steps: number[]) => {
  for (const ms of steps) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }
};

describe("the leak test playing itself", () => {
  it("presses Try, then shows the empty result, without announcing it", () => {
    const { result } = setup();
    const spoken = result.current.spoken;
    expect(result.current.demo).toBe(true);
    advance(DEMO.hold);
    expect(result.current.pressing).toEqual({ kind: "try" });
    expect(result.current.view.asking).toBe(false);
    advance(DEMO.press);
    expect(result.current.pressing).toBeNull();
    expect(result.current.view.asking).toBe(true);
    expect(result.current.view.returned).toBeNull();
    // The figure's line moves on; the live region doesn't.
    expect(result.current.view.line).toMatch(/holds back Birch's/);
    expect(result.current.spoken).toBe(spoken);
    advance(DEMO.empty, DEMO.press);
    expect(result.current.view.asking).toBe(false);
    advance(DEMO.hold, DEMO.press);
    expect(result.current.view.who).toBe("Birch");
  });

  it("stops at once for the visitor, announces their move, and picks up after ten idle seconds", () => {
    const { result } = setup();
    advance(DEMO.hold); // the demo is pressing Try
    act(() => result.current.pick("Cedar"));
    expect(result.current.pressing).toBeNull();
    expect(result.current.view.who).toBe("Cedar");
    expect(result.current.view.asking).toBe(false);
    expect(result.current.spoken).toBe(
      "Only Cedar's sessions come back, with no filter in the query.",
    );
    advance(DEMO.idle - 1);
    expect(result.current.pressing).toBeNull();
    advance(1);
    expect(result.current.pressing).toEqual({ kind: "try" });
  });

  it("holds while paused, and plays again at its own pace", () => {
    const { result } = setup();
    act(() => result.current.pause());
    expect(result.current.paused).toBe(true);
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
    expect(result.current.view.who).toBe("Alder");
    act(() => result.current.play());
    advance(DEMO.hold, DEMO.press);
    expect(result.current.view.asking).toBe(true);
  });

  it("holds while the controls have keyboard focus", () => {
    const { result } = setup();
    const target = document.createElement("button");
    target.matches = () => true;
    act(() =>
      result.current.focusProps.onFocus({
        target,
      } as unknown as FocusEvent<HTMLElement>),
    );
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
    act(() =>
      result.current.focusProps.onBlur({
        relatedTarget: null,
        currentTarget: document.createElement("div"),
      } as unknown as FocusEvent<HTMLElement>),
    );
    advance(DEMO.hold, DEMO.press);
    expect(result.current.view.asking).toBe(true);
  });

  it("holds while the figure is off screen or the tab is hidden", () => {
    const { result } = setup();
    onScreen(false);
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
    onScreen(true);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
  });

  it("only plays in the last step, and never under reduced motion", () => {
    const { result, rerender } = setup(2);
    expect(result.current.demo).toBe(false);
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
    rerender({ stage: 3, still: true });
    expect(result.current.demo).toBe(false);
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
    expect(result.current.view.who).toBe("Alder");
  });
});
