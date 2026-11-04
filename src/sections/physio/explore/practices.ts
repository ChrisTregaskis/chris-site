/** Shared, invented demo data for the physio prototypes (same as the live section). */
export type Practice = "Riverside" | "Harbour" | "Moorland";

export const PRACTICES: readonly Practice[] = [
  "Riverside",
  "Harbour",
  "Moorland",
] as const;

/** The practice the story signs in as. */
export const HOME: Practice = "Riverside";

export interface SessionRow {
  label: string;
  practice: Practice;
}

export const ROWS: readonly SessionRow[] = [
  { label: "First session", practice: "Riverside" },
  { label: "Sports massage", practice: "Harbour" },
  { label: "Mobility plan, week 3", practice: "Riverside" },
  { label: "Posture check-in", practice: "Moorland" },
  { label: "Follow-up session", practice: "Harbour" },
  { label: "Session notes", practice: "Riverside" },
  { label: "Running form review", practice: "Moorland" },
];

/** Each practice's mark, as Tailwind classes (fill, text, background, stroke). */
export const TINT: Record<
  Practice,
  { bg: string; text: string; fill: string; stroke: string }
> = {
  Riverside: {
    bg: "bg-accent",
    text: "text-accent",
    fill: "fill-accent",
    stroke: "stroke-accent",
  },
  Harbour: {
    bg: "bg-signal",
    text: "text-signal",
    fill: "fill-signal",
    stroke: "stroke-signal",
  },
  Moorland: {
    bg: "bg-tenant-teal",
    text: "text-tenant-teal",
    fill: "fill-tenant-teal",
    stroke: "stroke-tenant-teal",
  },
};

export interface StoryStep {
  title: string;
  text: string;
}

/** The live section's three steps, unchanged. */
export const STEPS: readonly StoryStep[] = [
  {
    title: "One database, every practice",
    text: "Sessions from every practice live in the same Postgres tables. Cheap to run and simple to migrate.",
  },
  {
    title: "Every request names its practice",
    text: "The tRPC context sets the current practice on the connection before a single query runs.",
  },
  {
    title: "Postgres hides the rest",
    text: "Row-level security filters out other practices' rows in the database itself, so a missed filter in app code can't leak data.",
  },
];
