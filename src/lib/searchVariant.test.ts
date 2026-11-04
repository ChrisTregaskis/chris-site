import { describe, expect, it } from "vitest";
import { searchVariant } from "./searchVariant";

describe("searchVariant", () => {
  it("returns an allowed value from the query string", () => {
    expect(searchVariant("?about=a", "about", ["a", "b"])).toBe("a");
    expect(searchVariant("?x=1&about=b", "about", ["a", "b"])).toBe("b");
  });

  it("returns null for a missing, empty or unknown value", () => {
    expect(searchVariant("", "about", ["a", "b"])).toBeNull();
    expect(searchVariant("?about=", "about", ["a", "b"])).toBeNull();
    expect(searchVariant("?about=c", "about", ["a", "b"])).toBeNull();
  });
});
