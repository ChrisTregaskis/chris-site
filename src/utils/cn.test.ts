import { describe, expect, it } from "vitest";
import { cn } from "./index";

const classesFor = (isHidden: boolean) =>
  cn("p-2", isHidden && "hidden", "p-4");

describe("cn", () => {
  it("merges conditional classes and lets later Tailwind classes win", () => {
    expect(classesFor(false)).toBe("p-4");
    expect(classesFor(true)).toBe("hidden p-4");
  });
});
