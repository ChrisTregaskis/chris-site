import { describe, expect, it } from "vitest";
import { ARCH_DRAFT, parseArchDraft } from "./archDraft";

describe("the how-it-runs draft switch", () => {
  it("picks a drawing, in the place it suits best", () => {
    expect(parseArchDraft("?physioarch=a")).toEqual({
      direction: "a",
      place: "before",
    });
    expect(parseArchDraft("?physioarch=b")).toEqual({
      direction: "b",
      place: "after",
    });
    expect(parseArchDraft("?x=1&physioarch=c")).toEqual({
      direction: "c",
      place: "before",
    });
  });

  it("lets the place be overridden, ignoring anything else", () => {
    expect(parseArchDraft("?physioarch=a&place=after")?.place).toBe("after");
    expect(parseArchDraft("?physioarch=b&place=before")?.place).toBe("before");
    expect(parseArchDraft("?physioarch=b&place=middle")?.place).toBe("after");
  });

  it("is the live chapter without a known drawing", () => {
    expect(parseArchDraft("")).toBeNull();
    expect(parseArchDraft("?physioarch=A")).toBeNull();
    expect(parseArchDraft("?physioarch=d")).toBeNull();
    expect(parseArchDraft("?place=before")).toBeNull();
    // The test page has no query.
    expect(ARCH_DRAFT).toBeNull();
  });
});
