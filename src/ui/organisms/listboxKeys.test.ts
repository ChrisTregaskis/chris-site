import { describe, expect, it } from "vitest";
import { listboxKey } from "./listboxKeys";

describe("listboxKey", () => {
  it("moves with the arrows, wrapping at both ends", () => {
    expect(listboxKey("ArrowDown", 0, 10)).toEqual({ type: "move", index: 1 });
    expect(listboxKey("ArrowDown", 9, 10)).toEqual({ type: "move", index: 0 });
    expect(listboxKey("ArrowUp", 0, 10)).toEqual({ type: "move", index: 9 });
  });

  it("jumps with Home, End and the digits (0 is the tenth)", () => {
    expect(listboxKey("Home", 5, 10)).toEqual({ type: "move", index: 0 });
    expect(listboxKey("End", 5, 10)).toEqual({ type: "move", index: 9 });
    expect(listboxKey("4", 0, 10)).toEqual({ type: "move", index: 3 });
    expect(listboxKey("0", 0, 10)).toEqual({ type: "move", index: 9 });
    expect(listboxKey("7", 0, 5)).toBeNull();
  });

  it("picks with Enter or Space and closes with Escape or Tab", () => {
    expect(listboxKey("Enter", 3, 10)).toEqual({ type: "pick", index: 3 });
    expect(listboxKey(" ", 3, 10)).toEqual({ type: "pick", index: 3 });
    expect(listboxKey("Escape", 3, 10)).toEqual({
      type: "close",
      refocus: true,
    });
    expect(listboxKey("Tab", 3, 10)).toEqual({ type: "close", refocus: false });
    expect(listboxKey("a", 3, 10)).toBeNull();
  });
});
