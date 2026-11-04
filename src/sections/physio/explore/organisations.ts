import { type StoryStep } from "./practices";

/*
 * Direction C's demo data, on the content brief's wording: tenants are
 * organisations (they buy the platform for their people), and the rows are
 * exercise sessions in a person's programme. Names and rows are invented
 * and deliberately generic: tree names, no real organisations, no clinical
 * content, no real schema.
 */
export type Org = "Alder" | "Birch" | "Cedar";

export const ORGS: readonly Org[] = ["Alder", "Birch", "Cedar"];

/** The organisation the story signs in as. */
export const HOME_ORG: Org = "Alder";

export interface OrgRow {
  label: string;
  org: Org;
}

export const ORG_ROWS: readonly OrgRow[] = [
  { label: "Mobility, phase 2, session 3", org: "Alder" },
  { label: "Mobility, phase 1, session 4", org: "Birch" },
  { label: "Balance, phase 1, session 2", org: "Alder" },
  { label: "Posture, phase 1, session 1", org: "Cedar" },
  { label: "Core, phase 2, session 2", org: "Birch" },
  { label: "Strength, phase 3, session 1", org: "Alder" },
  { label: "Strength, phase 2, session 5", org: "Cedar" },
];

/** Each organisation's mark: Tailwind classes, and its colour token for inline styles. */
export const ORG_TINT: Record<
  Org,
  { bg: string; text: string; token: string }
> = {
  Alder: { bg: "bg-accent", text: "text-accent", token: "accent" },
  Birch: { bg: "bg-signal", text: "text-signal", token: "signal" },
  Cedar: {
    bg: "bg-tenant-teal",
    text: "text-tenant-teal",
    token: "tenant-teal",
  },
};

export function rowsOf(org: Org): OrgRow[] {
  return ORG_ROWS.filter((row) => row.org === org);
}

/** The first organisation that isn't `org`: whose sessions the leak test asks for. */
export function otherOrg(org: Org): Org {
  return ORGS.find((o) => o !== org) ?? HOME_ORG;
}

/** The live steps, with the brief's wording fixes (organisations, the API, per transaction). */
export const ORG_STEPS: readonly StoryStep[] = [
  {
    title: "One database, every organisation",
    text: "Sessions from every organisation live in the same Postgres tables. Cheap to run and simple to migrate.",
  },
  {
    title: "Every request names its organisation",
    text: "The API takes the signed-in user's organisation and sets it on the transaction before a single query runs.",
  },
  {
    title: "Postgres hides the rest",
    text: "Row-level security filters out other organisations' rows in the database itself, so a missed filter in app code can't leak data.",
  },
];

/** The opener, with the same wording fixes (organisations, not practices or bookings; a start-up, in build). */
export const ORG_HEADING = {
  title: "A multi-tenant SaaS for physio and wellness",
  lede: "Exercise programmes for the people in many organisations, from one codebase and one database. A start-up I'm building with a co-founder, heading for launch, made with my own AI-assisted Claude Code workflow.",
  chips: [
    "React",
    "Zod",
    "Drizzle",
    "Postgres RLS",
    "AWS Lambda",
    "Cognito",
    "SST",
    "Turborepo",
  ],
};
