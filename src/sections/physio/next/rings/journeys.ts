import { type NodeId, type RouteKey } from "./geometry";

/*
 * The journeys a visitor can send through the rings, each with the route it
 * takes and the trace it writes. Pure, so the choreography can be tested
 * without the animation. The organisations (Alder, Birch) and the data are
 * invented; the trace says what happens, never how it's configured.
 */

export type JourneyId = "signIn" | "out" | "video" | "cross" | "job" | "admin";

export interface TraceLine {
  who: string;
  text: string;
}

/** What the queue's journey token shows: waiting, taken by a runner, or done. */
export type TokenState = "queued" | "claimed" | "done";

export type JourneyStep =
  | { type: "log"; line: TraceLine }
  | { type: "flash"; node: NodeId }
  /** Turned away here: the wall held. */
  | { type: "block"; node: NodeId }
  | { type: "travel"; route: RouteKey; reverse?: boolean }
  | { type: "token"; state: TokenState }
  /** A beat: time passing (the runner comes along later). */
  | { type: "pause"; ms: number }
  | { type: "result"; text: string; held: boolean };

export interface Journey {
  id: JourneyId;
  label: string;
  steps: readonly JourneyStep[];
}

const log = (who: string, text: string): JourneyStep => ({
  type: "log",
  line: { who, text },
});
const flash = (node: NodeId): JourneyStep => ({ type: "flash", node });
const block = (node: NodeId): JourneyStep => ({ type: "block", node });
const go = (route: RouteKey): JourneyStep => ({ type: "travel", route });
const back = (route: RouteKey): JourneyStep => ({
  type: "travel",
  route,
  reverse: true,
});
const token = (state: TokenState): JourneyStep => ({ type: "token", state });
const pause = (ms: number): JourneyStep => ({ type: "pause", ms });
const result = (text: string, held = false): JourneyStep => ({
  type: "result",
  text,
  held,
});

/** In through the API to a request handler. */
const inbound = (who: string): JourneyStep[] => [
  go("visitor-api"),
  flash("api"),
  log("api", `token checked: ${who}`),
  go("api-fn"),
  flash("fnRequest"),
];
const outbound: JourneyStep[] = [back("api-fn"), back("visitor-api")];

export const JOURNEYS: readonly Journey[] = [
  {
    id: "signIn",
    label: "Sign in",
    steps: [
      log("visitor", "signs in as a member of Alder"),
      flash("visitor"),
      go("visitor-signIn"),
      flash("signIn"),
      log("sign-in", "signed in; the token names Alder"),
      back("visitor-signIn"),
      go("visitor-api"),
      flash("api"),
      log("api", "token checked at the door: organisation Alder"),
      back("visitor-api"),
      result("Signed in as Alder"),
    ],
  },
  {
    id: "out",
    label: "Reach the internet",
    steps: [
      log("function", "tries to call a site on the internet"),
      go("fn-noRoute"),
      block("noRoute"),
      log("network", "no route out: nothing leaves"),
      pause(900),
      back("fn-noRoute"),
      result("Nowhere to go", true),
    ],
  },
  {
    id: "video",
    label: "Play a video",
    steps: [
      log("visitor", "asks to play an exercise video"),
      flash("visitor"),
      ...inbound("organisation Alder"),
      go("fn-video"),
      flash("fnVideo"),
      log("video", "checks access, signs a short-lived link"),
      back("fn-video"),
      ...outbound,
      log("visitor", "gets the link, never the key"),
      go("visitor-cdn"),
      flash("cdn"),
      log("cdn", "signature valid"),
      go("cdn-storage"),
      flash("storage"),
      log("storage", "private: only the CDN can read it"),
      back("cdn-storage"),
      back("visitor-cdn"),
      result("Playing: Balance, phase 1"),
    ],
  },
  {
    id: "cross",
    label: "Read another organisation",
    steps: [
      log("visitor", "signed in as Alder, asks for Birch's sessions"),
      flash("visitor"),
      ...inbound("organisation Alder"),
      log("function", "transaction set to Alder; the query names Birch"),
      go("fn-policy"),
      block("policy"),
      log("policy", "Birch's rows aren't Alder's: none come back"),
      pause(900),
      log("role", "owns no tables, so it can't step round the policy"),
      back("fn-policy"),
      ...outbound,
      result("No sessions", true),
    ],
  },
  {
    id: "job",
    label: "Submit an assessment",
    steps: [
      log("visitor", "submits an assessment"),
      flash("visitor"),
      ...inbound("organisation Alder"),
      go("fn-data"),
      flash("data"),
      token("queued"),
      log("function", "saves the answers and queues a job, in one transaction"),
      back("fn-data"),
      ...outbound,
      log("visitor", "done at once; the scoring happens in the background"),
      pause(900),
      flash("schedule"),
      go("schedule-runner"),
      flash("runner"),
      log("schedule", "wakes the runner"),
      go("runner-data"),
      token("claimed"),
      flash("data"),
      log("runner", "claims the job, locked so no other runner takes it"),
      flash("policy"),
      log("runner", "works inside Alder, under the same policy as a click"),
      token("done"),
      log("runner", "programme built; the job keeps only ids"),
      back("runner-data"),
      back("schedule-runner"),
      go("schedule-sweeper"),
      flash("sweeper"),
      go("sweeper-data"),
      log("sweeper", "looks for jobs stuck mid-run: none"),
      back("sweeper-data"),
      back("schedule-sweeper"),
      result("Programme ready"),
    ],
  },
  {
    id: "admin",
    label: "Read as an admin",
    steps: [
      log("admin", "opens the way in under their own IAM sign-in"),
      flash("admin"),
      go("admin-host"),
      flash("gate"),
      flash("host"),
      log("host", "private, no public address"),
      go("host-data"),
      flash("data"),
      log("postgres", "read-only login: the rows come back"),
      back("host-data"),
      log("admin", "tries an update"),
      go("host-data"),
      block("data"),
      log("postgres", "refused: this login can't write"),
      pause(900),
      back("host-data"),
      back("admin-host"),
      result("Read: yes. Write: refused.", true),
    ],
  },
];

export function journeyById(id: JourneyId): Journey {
  const journey = JOURNEYS.find((j) => j.id === id);
  if (!journey) throw new Error(`No journey ${id}`);
  return journey;
}

/** Every trace line a journey writes, in order. */
export function traceOf(journey: Journey): TraceLine[] {
  return journey.steps.flatMap((step) =>
    step.type === "log" ? [step.line] : [],
  );
}

/** The hops a journey travels, as `route` or `route back`. */
export function hopsOf(journey: Journey): string[] {
  return journey.steps.flatMap((step) =>
    step.type === "travel"
      ? [`${step.route}${step.reverse ? " back" : ""}`]
      : [],
  );
}
