/*
 * The physio chapter's demo data. Tenants are organisations (they buy the
 * platform for their people) and the rows are exercise sessions in a
 * person's programme. Names and rows are invented and deliberately generic:
 * tree names, no real organisations, no clinical content, no real schema.
 */
export type Org = "Alder" | "Birch" | "Cedar";

export const ORGS: readonly Org[] = ["Alder", "Birch", "Cedar"];

/** The organisation the story signs in as. */
export const HOME_ORG: Org = "Alder";

export interface OrgRow {
  label: string;
  org: Org;
}

/** The sessions table, in table order: every organisation's rows interleaved. */
export const ORG_ROWS: readonly OrgRow[] = [
  { label: "Mobility, phase 2, session 3", org: "Alder" },
  { label: "Mobility, phase 1, session 4", org: "Birch" },
  { label: "Balance, phase 1, session 2", org: "Alder" },
  { label: "Posture, phase 1, session 1", org: "Cedar" },
  { label: "Core, phase 2, session 2", org: "Birch" },
  { label: "Strength, phase 3, session 1", org: "Alder" },
  { label: "Strength, phase 2, session 5", org: "Cedar" },
];

/** One organisation's rows, each with its place in the one table. */
export function rowsOf(org: Org): { row: OrgRow; index: number }[] {
  return ORG_ROWS.map((row, index) => ({ row, index })).filter(
    ({ row }) => row.org === org,
  );
}

/** The most rows any one organisation has: the tallest result. */
export const MOST_ROWS = Math.max(...ORGS.map((org) => rowsOf(org).length));

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

/** A sheet's edge in its organisation's colour; a result's glows. */
export function sheetEdge(org: Org, lit: boolean, glow = 48): string {
  const colour = `var(--color-${ORG_TINT[org].token})`;
  return lit
    ? `inset 0 0 0 1.5px rgb(${colour} / 0.95), 0 0 ${glow}px -${glow / 4}px rgb(${colour} / 0.55)`
    : `inset 0 0 0 1px rgb(${colour} / 0.4)`;
}

/** The policy as the figure labels it. */
export const POLICY_RULE = "policy: organisation_id = current organisation";

/** The first organisation that isn't `org`: whose sessions the leak test asks for. */
export function otherOrg(org: Org): Org {
  return ORGS.find((o) => o !== org) ?? HOME_ORG;
}

export interface PhysioStep {
  title: string;
  text: string;
}

/** The chapter's three scroll steps. */
export const PHYSIO_STEPS: readonly PhysioStep[] = [
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
