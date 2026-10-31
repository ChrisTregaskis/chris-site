import defaultTheme from "tailwindcss/defaultTheme";
import { describe, expect, it } from "vitest";
import config from "../../../tailwind.config";

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

describe("tailwind config", () => {
  it("adds no key that shadows a Tailwind default", () => {
    const shadowed: string[] = [];
    for (const [group, values] of Object.entries(extend)) {
      const defaults = (defaultTheme as Record<string, unknown>)[group];
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
});
