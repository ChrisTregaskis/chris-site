import { describe, expect, it } from "vitest";
import { scrollFeelFrom } from "./scrollFeel";

describe("scrollFeelFrom", () => {
  it("picks a prototype from ?scroll=", () => {
    expect(scrollFeelFrom("?scroll=a")).toBe("a");
    expect(scrollFeelFrom("?scroll=b")).toBe("b");
    expect(scrollFeelFrom("?utm_source=x&scroll=c")).toBe("c");
  });

  it("is the live site without it, or with anything it doesn't know", () => {
    expect(scrollFeelFrom("")).toBeNull();
    expect(scrollFeelFrom("?scroll=")).toBeNull();
    expect(scrollFeelFrom("?scroll=d")).toBeNull();
    expect(scrollFeelFrom("?scroll=A")).toBeNull();
    expect(scrollFeelFrom("?other=a")).toBeNull();
  });
});
