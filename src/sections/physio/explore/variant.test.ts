import { describe, expect, it } from "vitest";
import { parseDraft, PHONE_DRAFT } from "./variant";

describe("the phone drafts' switch", () => {
  it("reads a draft from ?physiom=, and nothing else", () => {
    expect(parseDraft("?physiom=a")).toBe("a");
    expect(parseDraft("?x=1&physiom=c")).toBe("c");
    expect(parseDraft("?physiom=B")).toBeNull();
    expect(parseDraft("?physiom=z")).toBeNull();
    expect(parseDraft("?burpees=a")).toBeNull();
    expect(parseDraft("")).toBeNull();
  });

  it("is off with no param: the live chapter, untouched", () => {
    expect(PHONE_DRAFT).toBeNull();
  });
});
