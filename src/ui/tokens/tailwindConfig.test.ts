import resolveConfig from "tailwindcss/resolveConfig";
import { describe, expect, it } from "vitest";
import config from "../../../tailwind.config";
import { TOKEN_MERGE_KEYS } from "@/lib/cn";

const LEGACY_COLOUR_KEYS = [
  "dark",
  "light",
  "bgColor",
  "textColorPrimary",
  "textColorSecondary",
  "buttonPrimary",
  "buttonSecondary",
];

const extend = config.theme.extend as Record<string, object>;

// Resolved, so groups Tailwind defines as functions (colors, maxWidth…) are
// plain objects we can check keys against.
const defaultTheme = resolveConfig({ content: [] }).theme as Record<
  string,
  unknown
>;

describe("tailwind config", () => {
  it("adds no key that shadows a Tailwind default", () => {
    const shadowed: string[] = [];
    for (const [group, values] of Object.entries(extend)) {
      const defaults = defaultTheme[group];
      expect(defaults, group).toBeTypeOf("object");
      if (!defaults || typeof defaults !== "object") continue;
      for (const key of Object.keys(values)) {
        if (key in defaults) shadowed.push(`${group}.${key}`);
      }
    }
    expect(shadowed).toEqual([]);
  });

  it("keeps the legacy colour keys", () => {
    const colours = extend.colors as Record<string, unknown>;
    for (const key of LEGACY_COLOUR_KEYS) {
      expect(colours).toHaveProperty(key);
    }
    expect(extend.animation).toHaveProperty("spin-fast");
  });

  it("tells tailwind-merge about every token size, shadow and radius", () => {
    for (const [group, keys] of Object.entries(TOKEN_MERGE_KEYS)) {
      expect(Object.keys(extend[group]).sort(), group).toEqual(
        [...keys].sort(),
      );
    }
  });
});
