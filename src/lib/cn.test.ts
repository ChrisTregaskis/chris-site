import { describe, expect, it } from "vitest";
import { cn } from "./cn";

const classesFor = (isHidden: boolean) =>
  cn("p-2", isHidden && "hidden", "p-4");

describe("cn", () => {
  it("merges conditional classes and lets later Tailwind classes win", () => {
    expect(classesFor(false)).toBe("p-4");
    expect(classesFor(true)).toBe("hidden p-4");
  });
});

describe("cn with design tokens", () => {
  it("keeps a token text size alongside a token text colour", () => {
    expect(cn("text-body-sm", "text-on-accent")).toBe(
      "text-body-sm text-on-accent",
    );
  });

  it("lets a later token size, shadow or radius win", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
    expect(cn("shadow-ring-line", "shadow-ring-accent")).toBe(
      "shadow-ring-accent",
    );
    expect(cn("rounded-card", "rounded-pill")).toBe("rounded-pill");
  });
});
