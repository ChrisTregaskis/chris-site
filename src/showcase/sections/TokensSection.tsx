import { useState } from "react";
import { ShowcaseSection } from "../ShowcaseSection";
import { cn } from "@/lib/cn";
import { DURATION, EASE, STAGGER } from "@/ui/tokens/motion";
import { BREAKPOINT } from "@/ui/tokens/breakpoints";

// Class names are written out in full so Tailwind can find them.
const COLOURS = [
  { name: "surface", swatch: "bg-surface", use: "Page" },
  { name: "panel", swatch: "bg-panel", use: "Cards, drawer, dropdown" },
  { name: "raised", swatch: "bg-raised", use: "Chips, badges, hover rows" },
  { name: "line", swatch: "bg-line", use: "Borders and rules" },
  { name: "line-strong", swatch: "bg-line-strong", use: "Figure strokes" },
  { name: "line-hover", swatch: "bg-line-hover", use: "Input hover border" },
  { name: "ink", swatch: "bg-ink", use: "Body text" },
  { name: "muted", swatch: "bg-muted", use: "Secondary text" },
  { name: "accent", swatch: "bg-accent", use: "Primary button, active" },
  { name: "accent-strong", swatch: "bg-accent-strong", use: "Active border" },
  { name: "on-accent", swatch: "bg-on-accent", use: "Text on accent" },
  { name: "signal", swatch: "bg-signal", use: "Focus ring, pressed" },
  { name: "danger", swatch: "bg-danger", use: "Invalid border" },
  { name: "danger-ink", swatch: "bg-danger-ink", use: "Error text" },
  { name: "scrim", swatch: "bg-scrim/[0.66]", use: "Drawer backdrop (66%)" },
];

const TYPE_SCALE = [
  {
    name: "display-xl",
    className: "font-display text-display-xl font-semibold",
  },
  {
    name: "display-lg",
    className: "font-display text-display-lg font-semibold",
  },
  {
    name: "display-md",
    className: "font-display text-display-md font-semibold",
  },
  { name: "title-lg", className: "font-display text-title-lg font-semibold" },
  { name: "title", className: "font-display text-title font-semibold" },
  { name: "lede", className: "text-lede text-muted" },
  { name: "body-lg", className: "text-body-lg" },
  { name: "body", className: "text-body" },
  { name: "body-sm", className: "text-body-sm" },
  { name: "label", className: "text-label font-semibold" },
  { name: "caption", className: "text-caption text-muted" },
  { name: "eyebrow", className: "text-eyebrow uppercase text-muted" },
  { name: "mono-sm", className: "font-code text-mono-sm text-muted" },
];

const RADII = [
  { name: "badge", className: "rounded-badge" },
  { name: "row", className: "rounded-row" },
  { name: "input", className: "rounded-input" },
  { name: "control", className: "rounded-control" },
  { name: "card", className: "rounded-card" },
  { name: "sheet", className: "rounded-sheet" },
  { name: "pill", className: "rounded-pill" },
];

const SHADOWS = [
  { name: "popover", className: "shadow-popover" },
  { name: "float", className: "shadow-float" },
  { name: "phone", className: "shadow-phone" },
  { name: "drawer", className: "shadow-drawer" },
  { name: "focus-glow", className: "shadow-focus-glow" },
  { name: "ring-line", className: "shadow-ring-line" },
  { name: "ring-accent", className: "shadow-ring-accent" },
];

const DURATIONS = [
  { name: "fast", className: "duration-fast" },
  { name: "base", className: "duration-base" },
  { name: "enter", className: "duration-enter" },
  { name: "state", className: "duration-state" },
  { name: "slow", className: "duration-slow" },
  { name: "flash", className: "duration-flash" },
] as const;

const EASES = [
  { name: "enter", className: "ease-enter" },
  { name: "lift", className: "ease-lift" },
  { name: "tick", className: "ease-tick" },
] as const;

const SAMPLE = "Ideas into working software";

function Swatches() {
  return (
    <ul className="grid grid-cols-2 gap-4 sheet:grid-cols-3 wide:grid-cols-5">
      {COLOURS.map((colour) => (
        <li key={colour.name}>
          <div
            className={cn("h-16 rounded-row shadow-ring-line", colour.swatch)}
          />
          <p className="mt-2 font-code text-mono-sm">{colour.name}</p>
          <p className="text-caption text-muted">{colour.use}</p>
        </li>
      ))}
    </ul>
  );
}

function TypeScale() {
  return (
    <ul className="flex flex-col gap-5">
      {TYPE_SCALE.map((step) => (
        <li
          key={step.name}
          className="grid gap-1 wide:grid-cols-[10rem_minmax(0,1fr)] wide:items-baseline"
        >
          <span className="font-code text-mono-sm text-muted">{step.name}</span>
          <span className={cn("break-words", step.className)}>{SAMPLE}</span>
        </li>
      ))}
    </ul>
  );
}

function Radii() {
  return (
    <ul className="flex flex-wrap gap-5">
      {RADII.map((radius) => (
        <li key={radius.name} className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "h-16 w-20 border border-line bg-panel",
              radius.className,
            )}
          />
          <span className="font-code text-mono-sm text-muted">
            {radius.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Shadows() {
  return (
    <ul className="grid grid-cols-2 gap-8 wide:grid-cols-6">
      {SHADOWS.map((shadow) => (
        <li key={shadow.name} className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "h-20 w-full rounded-card bg-panel",
              shadow.className,
            )}
          />
          <span className="font-code text-mono-sm text-muted">
            {shadow.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MotionTokens() {
  const [moved, setMoved] = useState(false);
  const track = (className: string, label: string, value: string) => (
    <li
      key={label}
      className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3"
    >
      <span className="font-code text-mono-sm text-muted">
        {label}
        <br />
        {value}
      </span>
      <div className="relative h-6 rounded-pill bg-panel">
        <span
          className={cn(
            "absolute left-1 top-1 size-4 rounded-pill bg-accent transition-[left] motion-reduce:transition-none",
            moved && "left-[calc(100%-1.25rem)]",
            className,
          )}
        />
      </div>
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setMoved((value) => !value)}
        className="self-start rounded-pill bg-raised px-4 py-2 text-body-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-signal"
      >
        Play the duration and ease rows
      </button>
      <ul className="flex flex-col gap-3">
        {DURATIONS.map((duration) =>
          track(
            cn("ease-enter", duration.className),
            `duration-${duration.name}`,
            `${DURATION[duration.name] * 1000}ms`,
          ),
        )}
        {EASES.map((ease) =>
          track(
            cn("duration-slow", ease.className),
            `ease-${ease.name}`,
            EASE[ease.name].join(", "),
          ),
        )}
      </ul>
      <p className="text-caption text-muted">
        Stagger: tight {STAGGER.tight * 1000}ms, base {STAGGER.base * 1000}ms,
        loose {STAGGER.loose * 1000}ms (see Motion presets below). Breakpoints:
        sheet {BREAKPOINT.sheet}px, wide {BREAKPOINT.wide}px.
      </p>
    </div>
  );
}

export function TokensSection() {
  return (
    <>
      <ShowcaseSection title="Colour">
        <Swatches />
      </ShowcaseSection>
      <ShowcaseSection title="Type">
        <TypeScale />
      </ShowcaseSection>
      <ShowcaseSection title="Radii">
        <Radii />
      </ShowcaseSection>
      <ShowcaseSection title="Shadows">
        <Shadows />
      </ShowcaseSection>
      <ShowcaseSection title="Motion tokens">
        <MotionTokens />
      </ShowcaseSection>
    </>
  );
}
