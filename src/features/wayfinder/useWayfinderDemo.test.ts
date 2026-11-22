import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCRIPTED_REPLY, SUGGESTIONS } from "./demo";
import { ROUTE_KEYS } from "./iso";
import { LIT_HOLD_MS, useWayfinderDemo } from "./useWayfinderDemo";

afterEach(() => {
  vi.useRealTimers();
});

const lastReply = (messages: { from: string }[]) => messages.at(-1);

describe("useWayfinderDemo", () => {
  it("shows a message at once, but holds it back from the figure until it is ready", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(true));
    let ready: () => void = () => {};
    const whole = new Promise<void>((resolve) => {
      ready = resolve;
    });

    let sent: Promise<void> = Promise.resolve();
    act(() => {
      sent = result.current.send("Do you do vans?", undefined, whole);
    });
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "me", text: "Do you do vans?" }),
    );
    expect(result.current.typing).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    // Nothing has set off yet.
    expect(result.current.trace).toEqual([]);
    expect(result.current.lit.size).toBe(0);

    await act(async () => {
      ready();
      await sent;
    });
    expect(result.current.trace.length).toBeGreaterThan(0);
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "bot", kind: "scripted" }),
    );
  });

  it("keeps typing while free text travels to the supervisor and back, then replies with the scripted line", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(false));

    let sent: Promise<void> = Promise.resolve();
    act(() => {
      sent = result.current.send("Do you do vans?");
    });
    expect(result.current.typing).toBe(true);
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "me", text: "Do you do vans?" }),
    );
    // Out and back on two short pipes: well under two seconds.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      await sent;
    });
    expect(result.current.typing).toBe(false);
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "bot", kind: "scripted" }),
    );
    expect([...result.current.lit]).toEqual(["chat-bff", "bff-sup"]);
    expect(SCRIPTED_REPLY).toBe(
      "This is a scripted response. Try clicking the pills below?",
    );
  });

  it("answers a pill with its own reply, lighting only its route", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(true));
    const hybrid = SUGGESTIONS.find(
      (suggestion) => suggestion.key === "explain",
    );
    if (!hybrid) throw new Error("no explain pill");

    await act(async () => {
      await result.current.send(hybrid.question, hybrid);
    });
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "bot", kind: "explain" }),
    );
    expect([...result.current.lit].sort()).toEqual(
      ["adp-ai1", "bff-sup", "chat-bff", "sup-adp"].sort(),
    );
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });

  it("draws each pipe on behind the pulse, leaves it lit as the reply lands, and hides the pulse while it waits", async () => {
    vi.useFakeTimers();
    // A stand-in figure: the pulse and a lit line per pipe in one SVG.
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    for (const key of ROUTE_KEYS) {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("data-route", key);
      svg.append(path);
    }
    const pulse = document.createElementNS(ns, "g");
    svg.append(pulse);
    document.body.append(svg);
    const line = (key: string) =>
      svg.querySelector<SVGPathElement>(`[data-route="${key}"]`);

    const { result } = renderHook(() => useWayfinderDemo(false));
    (result.current.pulseRef as { current: SVGGElement | null }).current =
      pulse;
    const suv = SUGGESTIONS.find((suggestion) => suggestion.key === "vehicle");
    if (!suv) throw new Error("no vehicle pill");

    let sent: Promise<void> = Promise.resolve();
    act(() => {
      sent = result.current.send(suv.question, suv);
    });
    // Part way along the first pipe: drawn on as far as the pulse.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    const offset = Number(line("chat-bff")?.style.strokeDashoffset);
    expect(line("chat-bff")?.style.strokeDasharray).toBe("1 2");
    expect(offset).toBeGreaterThan(0);
    expect(offset).toBeLessThan(1);
    expect(pulse.getAttribute("visibility")).toBe("visible");

    // Until the reply lands, a little at a time so its route's clear (a
    // moment later) hasn't come due.
    for (let waited = 0; result.current.typing && waited < 20000; ) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      waited += 50;
    }
    await act(async () => {
      await sent;
    });
    expect(result.current.typing).toBe(false);
    for (const key of result.current.lit) {
      expect(line(key)?.style.strokeDasharray).toBe("");
      expect(line(key)?.style.strokeDashoffset).toBe("");
    }
    expect(result.current.lit.has("s0-mcp")).toBe(true);
    expect(pulse.getAttribute("visibility")).toBe("hidden");
    svg.remove();
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });

  it("clears the highlighted route a moment after the reply lands", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(false));

    let sent: Promise<void> = Promise.resolve();
    act(() => {
      sent = result.current.send("Do you do vans?");
    });
    // Out and back on two short pipes: well under a second and a half.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
      await sent;
    });
    expect(result.current.typing).toBe(false);
    expect(result.current.lit.size).toBeGreaterThan(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIT_HOLD_MS);
    });
    expect(result.current.lit.size).toBe(0);
  });

  it("clears it under reduced motion too, once the flashed parts have gone", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(true));

    await act(async () => {
      await result.current.send("Do you do vans?");
    });
    expect([...result.current.lit]).toEqual(["chat-bff", "bff-sup"]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3900);
    });
    expect(result.current.lit.size).toBe(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(result.current.lit.size).toBe(0);
    expect(result.current.hot.size).toBe(0);
  });

  it("never lets one message's clear wipe the next message's route", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWayfinderDemo(false));
    const hybrid = SUGGESTIONS.find(
      (suggestion) => suggestion.key === "explain",
    );
    if (!hybrid) throw new Error("no explain pill");

    let first: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current.send("Do you do vans?");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
      await first;
    });
    expect(result.current.typing).toBe(false);

    // Sent again before the first route has cleared.
    let second: Promise<void> = Promise.resolve();
    act(() => {
      second = result.current.send(hybrid.question, hybrid);
    });
    // Past when the first route would have cleared, mid-way round the second.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIT_HOLD_MS + 100);
    });
    expect(result.current.typing).toBe(true);
    expect(result.current.lit.size).toBeGreaterThan(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
      await second;
    });
    expect(lastReply(result.current.messages)).toEqual(
      expect.objectContaining({ from: "bot", kind: "explain" }),
    );
    expect(result.current.lit.size).toBe(0);
  });
});
