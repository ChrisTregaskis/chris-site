import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design-token keys tailwind-merge can't infer from their names. Without
 * them it reads `text-body-sm` as a colour and drops it beside `text-ink`.
 * A test keeps these in step with tailwind.config.ts.
 */
export const TOKEN_MERGE_KEYS = {
  fontSize: [
    "display-xl",
    "display-lg",
    "display-md",
    "title-lg",
    "title",
    "lede",
    "body-lg",
    "body",
    "body-sm",
    "label",
    "caption",
    "eyebrow",
    "mono-sm",
  ],
  boxShadow: [
    "popover",
    "raised",
    "drawer",
    "focus-glow",
    "ring-line",
    "ring-accent",
  ],
  borderRadius: ["badge", "row", "input", "control", "card", "sheet", "pill"],
} as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TOKEN_MERGE_KEYS.fontSize] }],
      shadow: [{ shadow: [...TOKEN_MERGE_KEYS.boxShadow] }],
      rounded: [{ rounded: [...TOKEN_MERGE_KEYS.borderRadius] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
