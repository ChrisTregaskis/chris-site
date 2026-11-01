import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCROLL_FRAME_MARGIN, useScrollFrame } from "./useScrollFrame";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/** Animation frames the test runs by hand. */
function fakeFrames() {
  let queue: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    queue.push(callback);
    return queue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    queue = [];
  });
  return {
    pending: () => queue.length,
    flush: () => {
      const run = queue;
      queue = [];
      for (const callback of run) callback(0);
    },
  };
}

/** An IntersectionObserver the test can fire by hand. */
function fakeObserver() {
  const observers: { callback: Callback; margin?: string }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        observers.push({ callback, margin: options?.rootMargin });
      }
      observe() {}
      disconnect() {}
    },
  );
  return {
    margin: () => observers.at(-1)?.margin,
    show: (isIntersecting: boolean) =>
      act(() => observers.at(-1)?.callback([{ isIntersecting }])),
  };
}

function Scene({
  onFrame,
  watched = false,
}: {
  onFrame: (resized: boolean) => void;
  watched?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame(onFrame, true, watched ? ref : undefined);
  return <div ref={ref} />;
}

const scroll = () => window.dispatchEvent(new Event("scroll"));

describe("useScrollFrame", () => {
  let frames: ReturnType<typeof fakeFrames>;
  beforeEach(() => {
    frames = fakeFrames();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs once at once, then at most once a frame, saying when there was a resize", () => {
    const onFrame = vi.fn();
    render(<Scene onFrame={onFrame} />);
    expect(onFrame).toHaveBeenCalledTimes(1);
    expect(onFrame).toHaveBeenLastCalledWith(true);

    scroll();
    scroll();
    scroll();
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(2);
    expect(onFrame).toHaveBeenLastCalledWith(false);

    window.dispatchEvent(new Event("resize"));
    scroll();
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(3);
    expect(onFrame).toHaveBeenLastCalledWith(true);
  });

  it("skips the work while its section is off screen", () => {
    const io = fakeObserver();
    const onFrame = vi.fn();
    render(<Scene onFrame={onFrame} watched />);
    expect(io.margin()).toBe(SCROLL_FRAME_MARGIN);
    onFrame.mockClear();

    // Leaving: one last call settles the final state...
    io.show(false);
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(1);

    // ...then scrolling elsewhere on the page costs nothing.
    scroll();
    window.dispatchEvent(new Event("resize"));
    scroll();
    expect(frames.pending()).toBe(0);
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(1);

    // Coming back catches up at once (and remembers the resize it missed).
    io.show(true);
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(2);
    expect(onFrame).toHaveBeenLastCalledWith(true);

    scroll();
    frames.flush();
    expect(onFrame).toHaveBeenCalledTimes(3);
  });

  it("ignores an observer report that changes nothing", () => {
    const io = fakeObserver();
    const onFrame = vi.fn();
    render(<Scene onFrame={onFrame} watched />);
    onFrame.mockClear();

    io.show(true);
    expect(frames.pending()).toBe(0);
  });
});
