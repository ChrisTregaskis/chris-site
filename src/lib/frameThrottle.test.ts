import { afterEach, describe, expect, it, vi } from "vitest";
import { frameThrottle } from "./frameThrottle";

describe("frameThrottle", () => {
  let frames: FrameRequestCallback[] = [];
  const flush = () => {
    const due = frames;
    frames = [];
    due.forEach((callback) => callback(0));
  };

  afterEach(() => {
    frames = [];
  });

  function stubFrames() {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      frames.splice(id - 1, 1);
    });
  }

  it("runs a burst of calls once, on the next frame", () => {
    stubFrames();
    const run = vi.fn();
    const throttled = frameThrottle(run);

    throttled();
    throttled();
    throttled();
    expect(run).not.toHaveBeenCalled();
    flush();
    expect(run).toHaveBeenCalledTimes(1);

    throttled();
    flush();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("drops a pending run when cancelled", () => {
    stubFrames();
    const run = vi.fn();
    const throttled = frameThrottle(run);

    throttled();
    throttled.cancel();
    flush();
    expect(run).not.toHaveBeenCalled();

    // And can be asked again afterwards.
    throttled();
    flush();
    expect(run).toHaveBeenCalledTimes(1);
  });
});
