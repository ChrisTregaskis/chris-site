import { type NodeId, type RouteKey } from "./geometry";

/*
 * The rings' scroll story (draft copy, pending Chris's language pass): the
 * drawing is revealed ring by ring from the outside in, then the two side
 * ways in (scheduled work and the admin), then the journeys. Design ideas
 * only: never versions, stage names, network rules or ranges, regions, role,
 * table, secret or variable names, how credentials reach the code, counts or
 * known gaps.
 */

export const STEP_ORDER = [
  "edge",
  "network",
  "functions",
  "centre",
  "queue",
  "admin",
  "try",
] as const;

export type StepId = (typeof STEP_ORDER)[number];

/** The rings themselves, revealed with their steps. */
export type RingId = "net" | "orbit" | "policy" | "tokens";

export interface Detail {
  id: string;
  text: string;
  /** What it picks out in the drawing. */
  nodes: readonly NodeId[];
  routes?: readonly RouteKey[];
  rings?: readonly RingId[];
}

export interface Step {
  id: StepId;
  kicker: string;
  heading: string;
  text: string;
  details: readonly Detail[];
  /** What this step adds to the drawing. */
  reveals: {
    nodes: readonly NodeId[];
    routes: readonly RouteKey[];
    rings: readonly RingId[];
  };
}

export const STEPS: Record<StepId, Step> = {
  edge: {
    id: "edge",
    kicker: "The edge",
    heading: "Everything comes in at the edge",
    text: "A visitor reaches the platform only through the API, the CDN and sign-in, a managed service of its own. Video storage sits behind the CDN, out of anyone's direct reach.",
    details: [
      {
        id: "edge-api",
        text: "The API checks the sign-in token on every request",
        nodes: ["api"],
        routes: ["visitor-api"],
      },
      {
        id: "edge-signin",
        text: "Sign-in issues a token that names the organisation",
        nodes: ["signIn"],
        routes: ["visitor-signIn"],
      },
      {
        id: "edge-cdn",
        text: "The CDN serves video only with a signed link",
        nodes: ["cdn"],
        routes: ["visitor-cdn"],
      },
      {
        id: "edge-storage",
        text: "Video storage is private: only the CDN can read it",
        nodes: ["storage"],
        routes: ["cdn-storage"],
      },
    ],
    reveals: {
      nodes: ["visitor", "api", "signIn", "cdn", "storage"],
      routes: ["visitor-api", "visitor-signIn", "visitor-cdn", "cdn-storage"],
      rings: [],
    },
  },
  network: {
    id: "network",
    kicker: "The private network",
    heading: "A network with no way out",
    text: "The functions run in a private network with no NAT, so nothing in it can reach the internet. They reach sign-in and video storage through private endpoints, never the open web.",
    details: [
      {
        id: "net-out",
        text: "No route out to the internet",
        nodes: ["noRoute"],
        routes: ["fn-noRoute"],
      },
      {
        id: "net-signin",
        text: "A private endpoint to sign-in",
        nodes: ["endpointSignIn"],
        routes: ["fn-signIn"],
      },
      {
        id: "net-storage",
        text: "A private endpoint to video storage",
        nodes: ["endpointStorage"],
        routes: ["fn-storage"],
      },
    ],
    reveals: {
      nodes: ["noRoute", "endpointSignIn", "endpointStorage"],
      routes: ["fn-noRoute", "fn-signIn", "fn-storage"],
      rings: ["net", "orbit"],
    },
  },
  functions: {
    id: "functions",
    kicker: "The functions",
    heading: "Only the keys each one needs",
    text: "Each function holds just the secrets its job needs, and tests fail if one is handed more. Requests are handed in by the API: nothing outside can connect to a function.",
    details: [
      {
        id: "fn-request",
        text: "Request handlers: the database login, nothing more",
        nodes: ["fnRequest"],
      },
      {
        id: "fn-video",
        text: "The video signer: the key that signs video links",
        nodes: ["fnVideo"],
      },
      {
        id: "fn-health",
        text: "The health check: nothing at all",
        nodes: ["fnHealth"],
      },
      {
        id: "fn-in",
        text: "No way to connect to a function: the API hands requests over",
        nodes: ["api", "fnRequest"],
        routes: ["api-fn"],
      },
    ],
    reveals: {
      nodes: ["fnRequest", "fnVideo", "fnHealth"],
      routes: ["api-fn", "fn-video"],
      rings: [],
    },
  },
  centre: {
    id: "centre",
    kicker: "Postgres",
    heading: "An app that owns nothing",
    text: "Every organisation's data shares one Postgres database. Each request sets its organisation on its own transaction, and row-level security hides every other organisation's rows. The app connects as a role that owns no tables, so it can't step round the policy.",
    details: [
      {
        id: "centre-transaction",
        text: "The organisation is set per transaction, safe with pooled connections",
        nodes: ["fnRequest", "policy"],
        routes: ["fn-data"],
      },
      {
        id: "centre-policy",
        text: "Row-level security in the database itself, not in app code",
        nodes: ["policy"],
        rings: ["policy"],
      },
      {
        id: "centre-role",
        text: "An owner can skip a policy; the app's role owns nothing",
        nodes: ["data"],
      },
      {
        id: "centre-tests",
        text: "Isolation tests run against a real Postgres, with helpers of their own",
        nodes: ["policy", "data"],
        rings: ["policy"],
      },
    ],
    reveals: {
      nodes: ["policy", "data"],
      routes: ["fn-data"],
      rings: ["policy"],
    },
  },
  queue: {
    id: "queue",
    kicker: "The queue",
    heading: "Slow work waits its turn",
    text: "Scoring an assessment and building a programme take longer than a click should. The request saves its answers and queues a job in the same transaction, then returns at once. The queue is a table in the same database, so every job can be read in SQL and carries its organisation with it.",
    details: [
      {
        id: "queue-schedule",
        text: "A schedule wakes the runner",
        nodes: ["schedule", "runner"],
        routes: ["schedule-runner"],
      },
      {
        id: "queue-claim",
        text: "Claimed safely: a runner locks the jobs it takes and skips any already taken",
        nodes: ["runner", "data"],
        routes: ["runner-data"],
        rings: ["tokens"],
      },
      {
        id: "queue-tenant",
        text: "Each job runs inside its own organisation, under the same policy as a click",
        nodes: ["runner", "policy"],
        rings: ["policy"],
      },
      {
        id: "queue-retry",
        text: "A failed job waits longer each time it retries, unless it would only fail the same way",
        nodes: ["runner"],
      },
      {
        id: "queue-sweep",
        text: "A sweep closes off any job stuck mid-run",
        nodes: ["sweeper"],
        routes: ["schedule-sweeper", "sweeper-data"],
      },
      {
        id: "queue-ids",
        text: "A finished job keeps only ids, no personal data",
        nodes: ["data"],
        rings: ["tokens"],
      },
    ],
    reveals: {
      nodes: ["schedule", "runner", "sweeper"],
      routes: [
        "schedule-runner",
        "runner-data",
        "schedule-sweeper",
        "sweeper-data",
      ],
      rings: ["tokens"],
    },
  },
  admin: {
    id: "admin",
    kicker: "The admin",
    heading: "Admins look, never touch",
    text: "An admin reaches the database through a private host with no public address, opened only under their own IAM sign-in, as a login that can read and never write. Changing the schema doesn't come this way at all: migrations run as one-job functions, started under IAM.",
    details: [
      {
        id: "admin-iam",
        text: "Opened only under the admin's own IAM sign-in",
        nodes: ["gate"],
        routes: ["admin-host"],
      },
      {
        id: "admin-host",
        text: "A private host with no public address",
        nodes: ["host"],
      },
      {
        id: "admin-read",
        text: "A read-only login: any write is refused",
        nodes: ["data"],
        routes: ["host-data"],
      },
    ],
    reveals: {
      nodes: ["admin", "gate", "host"],
      routes: ["admin-host", "host-data"],
      rings: [],
    },
  },
  try: {
    id: "try",
    kicker: "Try it",
    heading: "Now send something through it",
    text: "Pick a journey and watch it take the real route through the rings. The organisations and their data are invented.",
    details: [],
    reveals: { nodes: [], routes: [], rings: [] },
  },
};

/** Steps count from 1 (0 is "none yet"), in scroll order. */
export function stepNumber(id: StepId): number {
  return STEP_ORDER.indexOf(id) + 1;
}

export const TRY_STEP = stepNumber("try");

/** The step that reveals each node, route and ring. */
function firstStep<T extends string>(
  pick: (step: Step) => readonly T[],
): ReadonlyMap<T, number> {
  const map = new Map<T, number>();
  STEP_ORDER.forEach((id, index) => {
    for (const item of pick(STEPS[id])) {
      if (!map.has(item)) map.set(item, index + 1);
    }
  });
  return map;
}

export const NODE_STEP = firstStep((step) => step.reveals.nodes);
export const ROUTE_STEP = firstStep((step) => step.reveals.routes);
export const RING_STEP = firstStep((step) => step.reveals.rings);

export type Reveal = "hidden" | "new" | "shown";

/**
 * How a piece shows at a step: not yet (hidden), just revealed by it (new,
 * lit), or revealed earlier (shown). `all` shows everything (reduced motion
 * and the journeys).
 */
export function revealAt(
  revealedBy: number | undefined,
  current: number,
  all: boolean,
): Reveal {
  if (revealedBy === undefined) return "shown";
  if (all || current >= TRY_STEP) return "shown";
  if (current < revealedBy) return "hidden";
  return current === revealedBy ? "new" : "shown";
}
