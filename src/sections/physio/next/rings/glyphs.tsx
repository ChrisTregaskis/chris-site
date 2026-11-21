import { type ReactNode } from "react";

/*
 * The rings' icons, on a 24-unit grid, stroked in currentColor: one for each
 * node on the drawing, reused as the step cards' badges, so a card and its
 * part of the drawing match without numbers.
 */
export type GlyphId =
  | "person"
  | "eye"
  | "door"
  | "badge"
  | "globe"
  | "film"
  | "code"
  | "key"
  | "pulse"
  | "clock"
  | "loop"
  | "broom"
  | "server"
  | "lock"
  | "blocked"
  | "role"
  | "play"
  | "check"
  | "rings";

const PATHS: Record<GlyphId, ReactNode> = {
  person: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.5c0-4 3.1-7 7-7s7 3 7 7" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  door: (
    <path d="M11 4h7.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H11M3.5 12h10M10 8.5l3.5 3.5-3.5 3.5" />
  ),
  badge: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <circle cx="9" cy="12" r="2.2" />
      <path d="M14 10.5h3.5M14 13.5h3.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.3 3.8 5.2 3.8 8.5s-1.2 6.2-3.8 8.5c-2.6-2.3-3.8-5.2-3.8-8.5S9.4 5.8 12 3.5Z" />
    </>
  ),
  film: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m10 9 5 3-5 3Z" />
    </>
  ),
  code: <path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5" />,
  key: (
    <>
      <circle cx="7.5" cy="12" r="4" />
      <path d="M11.5 12H21M17.5 12v3.2M20.5 12v2.4" />
    </>
  ),
  pulse: <path d="M3 12h4l2.2-5.5 4.6 11 2.2-5.5H21" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  loop: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.8 4.5v3.8H16" />
    </>
  ),
  broom: <path d="M17.5 3.5 12 12M7 12.5h9l1.5 8h-12ZM9.5 16.5v4M13 16.5v4" />,
  server: (
    <>
      <rect x="4" y="4.5" width="16" height="6.5" rx="1.5" />
      <rect x="4" y="13" width="16" height="6.5" rx="1.5" />
      <path d="M7.5 7.8h.01M7.5 16.2h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  blocked: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.5 17.5 17.5 6.5" />
    </>
  ),
  role: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.5c0-4 3.1-7 7-7s7 3 7 7" strokeDasharray="2.5 2.5" />
    </>
  ),
  play: <path d="m8 5.5 11 6.5-11 6.5Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  rings: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
};

export const GLYPH_STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function GlyphPaths({ id }: { id: GlyphId }) {
  return PATHS[id];
}

/** An icon on its own (a step's badge, a journey's button). */
export function Glyph({ id, className }: { id: GlyphId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g {...GLYPH_STROKE}>
        <GlyphPaths id={id} />
      </g>
    </svg>
  );
}
