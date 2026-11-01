import { describe, expect, it } from "vitest";
import { LOG_PAD, chatScrollTop } from "./chatScroll";

describe("chatScrollTop", () => {
  it("scrolls to the bottom when the newest message fits", () => {
    expect(
      chatScrollTop({
        viewHeight: 200,
        contentHeight: 500,
        lastTop: 440,
        lastHeight: 48,
      }),
    ).toBe(300);
  });

  it("reads a reply taller than the log from its top", () => {
    expect(
      chatScrollTop({
        viewHeight: 168,
        contentHeight: 400,
        lastTop: 150,
        lastHeight: 238,
      }),
    ).toBe(150 - LOG_PAD);
  });

  it("never scrolls past the bottom or above the top", () => {
    expect(
      chatScrollTop({
        viewHeight: 100,
        contentHeight: 300,
        lastTop: 290,
        lastHeight: 120,
      }),
    ).toBe(200);
    expect(
      chatScrollTop({
        viewHeight: 100,
        contentHeight: 90,
        lastTop: 4,
        lastHeight: 90,
      }),
    ).toBe(0);
  });
});
