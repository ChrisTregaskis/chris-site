import { act, renderHook } from "@testing-library/react";
import { type FocusEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOOP } from "./demo";
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

/** The hook in a step (the last by default), its chapter on screen. */
function setup(stage = 3) {
  const hook = renderHook(({ stage: s }) => useLeakTest(s, { watch }), {
    initialProps: { stage },
  });
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

/** A keyboard focus event on one of the leak test's buttons. */
function keyboardFocus() {
  const target = document.createElement("button");
  target.matches = () => true;
  return { target } as unknown as FocusEvent<HTMLElement>;
}

describe("the leak test's example loop", () => {
  it("never plays by itself", () => {
    const { result } = setup();
    expect(result.current.loopable).toBe(true);
    expect(result.current.looping).toBe(false);
    advance(120_000);
    expect(result.current.pressing).toBeNull();
    expect(result.current.view.asking).toBe(false);
    expect(result.current.view.who).toBe("Alder");
  });

  it("plays once turned on: presses Try at once, then shows the empty result, without announcing it", () => {
    const { result } = setup();
    const spoken = result.current.spoken;
    act(() => result.current.toggleLoop());
    expect(result.current.looping).toBe(true);
    expect(result.current.pressing).toEqual({ kind: "try" });
    advance(LOOP.press);
    expect(result.current.view.asking).toBe(true);
    expect(result.current.view.line).toMatch(/holds back Birch's/);
    // The figure's line moves on; the live region doesn't.
    expect(result.current.spoken).toBe(spoken);
    advance(LOOP.empty, LOOP.press);
    expect(result.current.view.asking).toBe(false);
    advance(LOOP.hold, LOOP.press);
    expect(result.current.view.who).toBe("Birch");
  });

  it("turns off again from the toggle", () => {
    const { result } = setup();
    act(() => result.current.toggleLoop());
    act(() => result.current.toggleLoop());
    expect(result.current.looping).toBe(false);
    expect(result.current.pressing).toBeNull();
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
  });

  it("stops for good when the visitor uses a button, showing and announcing what they clicked", () => {
    const { result } = setup();
    act(() => result.current.toggleLoop());
    act(() => result.current.pick("Cedar"));
    expect(result.current.looping).toBe(false);
    expect(result.current.pressing).toBeNull();
    expect(result.current.view.who).toBe("Cedar");
    expect(result.current.spoken).toBe(
      "Only Cedar's sessions come back, with no filter in the query.",
    );
    // No pick-up after an idle wait: nothing plays by itself any more.
    advance(120_000);
    expect(result.current.view.asking).toBe(false);
    expect(result.current.looping).toBe(false);
  });

  it("stops when the visitor arrives on a button with the keyboard", () => {
    const { result } = setup();
    act(() => result.current.toggleLoop());
    act(() => result.current.focusProps.onFocus(keyboardFocus()));
    expect(result.current.looping).toBe(false);
  });

  it("stops when the last step is no longer current, and stays off on coming back", () => {
    const { result, rerender } = setup();
    act(() => result.current.toggleLoop());
    rerender({ stage: 2 });
    expect(result.current.looping).toBe(false);
    expect(result.current.loopable).toBe(false);
    rerender({ stage: 3 });
    expect(result.current.looping).toBe(false);
    advance(60_000);
    expect(result.current.view.asking).toBe(false);
  });

  it("stops when the chapter goes off screen, and stays off on coming back", () => {
    const { result } = setup();
    act(() => result.current.toggleLoop());
    onScreen(false);
    expect(result.current.looping).toBe(false);
    onScreen(true);
    advance(60_000);
    expect(result.current.looping).toBe(false);
    expect(result.current.view.asking).toBe(false);
  });

  it("holds while the browser tab is hidden, and carries on once it's back", () => {
    const { result } = setup();
    act(() => result.current.toggleLoop());
    const hidden = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    advance(60_000);
    expect(result.current.looping).toBe(true);
    expect(result.current.view.asking).toBe(false);
    hidden.mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    advance(LOOP.press);
    expect(result.current.view.asking).toBe(true);
  });
});
