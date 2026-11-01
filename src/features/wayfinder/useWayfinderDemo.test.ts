import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCRIPTED_REPLY, SUGGESTIONS } from "./demo";
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
});
