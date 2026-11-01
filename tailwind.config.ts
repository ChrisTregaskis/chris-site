import { type Config } from "tailwindcss";
import { BREAKPOINT } from "./src/ui/tokens/breakpoints";

const colour = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const COLOUR_TOKENS = [
  "surface",
  "panel",
  "raised",
  "line",
  "line-strong",
  "line-hover",
  "line-field",
  "ink",
  "muted",
  "accent",
  "accent-strong",
  "on-accent",
  "signal",
  "danger",
  "danger-ink",
  "scrim",
  "figure-top",
  "figure-left",
  "figure-right",
  "figure-on-left",
  "figure-base-left",
  "figure-base-right",
  "figure-base-on",
  "chat-surface",
  "chat-ink",
  "chat-strong",
  "chat-muted",
  "chat-line",
  "chat-card-line",
  "chat-bubble",
  "chat-media-from",
  "chat-media-to",
  "chat-typing",
  "bb-bezel",
  "bb-bezel-edge",
  "bb-screen",
  "bb-glow",
  "bb-ink",
  "bb-track",
  "bb-yellow",
  "bb-cadence",
  "bb-dark",
  "tenant-teal",
] as const;

// The showcase is a dev-only entry, never built into dist/, so production
// CSS skips its utilities.
const SHOWCASE_IN_CSS = process.env.NODE_ENV !== "production";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ...(SHOWCASE_IN_CSS ? [] : ["!./src/showcase/**"]),
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens (src/ui/tokens/tokens.css).
        ...Object.fromEntries(
          COLOUR_TOKENS.map((name) => [name, colour(name)]),
        ),
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        code: "var(--font-code)",
      },
      fontSize: {
        "display-xl": [
          "clamp(38px, 6.4vw, 84px)",
          { lineHeight: "1.02", letterSpacing: "-0.025em" },
        ],
        "display-lg": [
          "clamp(30px, 4.2vw, 54px)",
          { lineHeight: "1.04", letterSpacing: "-0.02em" },
        ],
        "display-md": [
          "clamp(30px, 3.6vw, 44px)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
        "title-lg": ["26px", { lineHeight: "1.2", letterSpacing: "0" }],
        title: ["23px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        lede: [
          "clamp(17px, 1.6vw, 19px)",
          { lineHeight: "1.6", letterSpacing: "0" },
        ],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0" }],
        body: ["17px", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-sm": ["15px", { lineHeight: "1.5", letterSpacing: "0" }],
        label: ["14px", { lineHeight: "1.4", letterSpacing: "0" }],
        caption: ["13px", { lineHeight: "1.4", letterSpacing: "0" }],
        eyebrow: ["13px", { lineHeight: "1.4", letterSpacing: "0.06em" }],
        "mono-sm": ["12px", { lineHeight: "1.6", letterSpacing: "0" }],
      },
      spacing: {
        gutter: "var(--space-gutter)",
        section: "var(--space-section)",
        "section-lg": "var(--space-section-lg)",
        nav: "var(--size-nav)",
      },
      maxWidth: {
        container: "var(--size-container)",
        measure: "var(--measure)",
        "measure-narrow": "var(--measure-narrow)",
      },
      borderRadius: {
        badge: "var(--radius-badge)",
        row: "var(--radius-row)",
        input: "var(--radius-input)",
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        sheet: "var(--radius-sheet)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        popover: "var(--shadow-popover)",
        float: "var(--shadow-float)",
        phone: "var(--shadow-phone)",
        drawer: "var(--shadow-drawer)",
        "focus-glow": "var(--shadow-focus-glow)",
        "ring-line": "var(--shadow-ring-line)",
        "ring-accent": "var(--shadow-ring-accent)",
        "ring-signal": "var(--shadow-ring-signal)",
      },
      screens: {
        sheet: `${BREAKPOINT.sheet}px`,
        wide: `${BREAKPOINT.wide}px`,
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        enter: "var(--duration-enter)",
        state: "var(--duration-state)",
        slow: "var(--duration-slow)",
        flash: "var(--duration-flash)",
      },
      transitionTimingFunction: {
        enter: "var(--ease-enter)",
        lift: "var(--ease-lift)",
        tick: "var(--ease-tick)",
      },
      keyframes: {
        // The CV drawer (from the right) and phone bottom sheet (from below),
        // as the enterFromRight / enterFromBelow motion presets.
        "drawer-in": {
          from: { transform: "translateX(40px)", opacity: "0" },
        },
        "sheet-up": {
          from: { transform: "translateY(40px)", opacity: "0" },
        },
        // The chat mock's typing dots (b3 "bl").
        "typing-dot": {
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        "drawer-in": "drawer-in var(--duration-enter) var(--ease-enter)",
        "sheet-up": "sheet-up var(--duration-enter) var(--ease-enter)",
        "typing-dot": "typing-dot 1s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
