import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCRIPTED_REPLY, SUGGESTIONS } from "./demo";
import { ROUTE_KEYS } from "./iso";
import { useWayfinderDemo } from "./useWayfinderDemo";

afterEach(() => {
  vi.useRealTimers();
});

const lastReply = (messages: { from: string }[]) => messages.at(-1);

describe("useWayfinderDemo", () => {
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

  it("draws each pipe on behind the pulse, then leaves it lit, and hides the pulse while it waits", async () => {
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

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
      await sent;
    });
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
});
