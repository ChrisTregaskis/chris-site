import { type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { type PrincipleId } from "./archCopy";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

/*
 * Shared pieces for the how-it-runs drawings: each principle's glyph (in the
 * list and on the drawing, so the two can be matched without numbers), the
 * map-style marker that carries it, and the one-off draw-in as the drawing
 * first scrolls into view (finished at once under reduced motion).
 */

export interface ArchFigureProps {
  /** The principle the pointer is over, lit in the drawing. */
  active: PrincipleId | null;
  still: boolean;
}

/** Each principle's glyph, on a 24-unit grid, stroked in currentColor. */
const GLYPHS: Record<PrincipleId, ReactNode> = {
  out: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.5 17.5 17.5 6.5" />
    </>
  ),
  keys: (
    <>
      <circle cx="7.5" cy="12" r="4" />
      <path d="M11.5 12H21M17.5 12v3.2M20.5 12v2.4" />
    </>
  ),
  role: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.5c0-4 3.1-7 7-7s7 3 7 7" />
    </>
  ),
  admin: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
};

export function GlyphPaths({ id }: { id: PrincipleId }) {
  return GLYPHS[id];
}

const GLYPH_STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A principle's glyph as a standalone icon (the list beside the drawing). */
export function Glyph({
  id,
  className,
}: {
  id: PrincipleId;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g {...GLYPH_STROKE}>
        <GlyphPaths id={id} />
      </g>
    </svg>
  );
}

/** Classes for a part of the drawing that a principle lights. */
export function lit(active: PrincipleId | null, id: PrincipleId): string {
  return cn(
    "transition-colors duration-base motion-reduce:transition-none",
    active === id ? "text-signal" : "text-accent",
  );
}

interface MarkerProps {
  id: PrincipleId;
  x: number;
  y: number;
  active: PrincipleId | null;
  /** The disc's radius; the glyph sits inside it. */
  r?: number;
}

/** A principle's glyph on a small disc, as a symbol on the drawing. */
export function Marker({ id, x, y, active, r = 12 }: MarkerProps) {
  const size = r * 1.25;
  return (
    <g data-marker={id} className={lit(active, id)}>
      <circle
        cx={x}
        cy={y}
        r={r}
        className="fill-[rgb(var(--color-tone-physio))]"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <g
        transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}
        {...GLYPH_STROKE}
        strokeWidth={2.1}
      >
        <GlyphPaths id={id} />
      </g>
    </g>
  );
}

/** The drawing's own motion: off until it first scrolls well into view. */
export function drawIn(still: boolean) {
  return still
    ? { initial: false as const, animate: "shown" }
    : {
        initial: "hidden",
        whileInView: "shown",
        viewport: { once: true, amount: 0.35 },
      };
}

/** A line drawing itself along its length. */
export function draw(delay: number): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    shown: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: DURATION.together,
          ease: [...EASE.enter],
          delay,
        },
        opacity: { duration: DURATION.fast, delay },
      },
    },
  };
}

/** Anything else arriving: a plain fade. */
export function fade(delay: number): Variants {
  return {
    hidden: { opacity: 0 },
    shown: {
      opacity: 1,
      transition: { duration: DURATION.slow, ease: [...EASE.enter], delay },
    },
  };
}
