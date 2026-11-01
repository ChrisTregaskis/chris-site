/**
 * The scripted Wayfinder demo: the questions offered under the chat, the
 * route each one takes through the figure, and the route a typed message
 * takes. Pure, so the choreography can be tested without the animation.
 */
import { type RouteKey } from "./iso";
import { type PartId, PLATFORMS, type PlatformIndex } from "./parts";

/** Which specialist (and tool) handles it, left to right in the figure. */
type Lane = 0 | 1 | 2;

/**
 * How far into the figure a message goes, which depends on what answering it
 * needs:
 * - `supervisor`: the BFF hands it to the supervisor and straight back (a
 *   typed message, which this demo answers with a scripted line).
 * - `platform`: the supervisor answers from the model, via the adapter.
 * - `specialist`: a specialist answers, but needs nothing live yet.
 * - `tools`: a specialist fetches live data (stock, a quote) over MCP.
 */
export type Route =
  | { reach: "supervisor" }
  | { reach: "platform"; note: string }
  | { reach: "specialist"; lane: Lane; agent: string; note: string }
  | { reach: "tools"; lane: Lane; agent: string; tool: string };

export type ReplyKind =
  | "vehicle"
  | "booking"
  | "finance"
  | "explain"
  | "scripted";

export interface Ask {
  /** The intent the supervisor reads, which also picks the scripted reply. */
  key: ReplyKind;
  route: Route;
  /** Drawn as a rich card (true) or a plain message bubble. */
  card: boolean;
}

export interface Suggestion extends Ask {
  key: Exclude<ReplyKind, "scripted">;
  label: string;
  question: string;
}

/** The quick questions offered under the chat, each with its own route. */
export const SUGGESTIONS: readonly Suggestion[] = [
  {
    key: "vehicle",
    label: "Find me a family SUV",
    question: "Find me a family SUV",
    route: {
      reach: "tools",
      lane: 0,
      agent: "vehicle agent",
      tool: "inventory.search",
    },
    card: true,
  },
  {
    key: "booking",
    label: "Book a test drive",
    question: "Book a test drive",
    route: {
      reach: "specialist",
      lane: 1,
      agent: "booking agent",
      note: "asks for a model and postcode first",
    },
    card: false,
  },
  {
    key: "finance",
    label: "Monthly cost?",
    question: "What would it cost a month?",
    route: {
      reach: "tools",
      lane: 2,
      agent: "finance agent",
      tool: "finance.quote",
    },
    card: true,
  },
  {
    key: "explain",
    label: "What's a hybrid?",
    question: "What's a hybrid?",
    route: { reach: "platform", note: "answers from the model, no tools" },
    card: false,
  },
];

/** Anything the visitor types: to the supervisor and back, scripted reply. */
export const FREE_TEXT: Ask = {
  key: "scripted",
  route: { reach: "supervisor" },
  card: false,
};

/** The reply to any typed message. */
export const SCRIPTED_REPLY =
  "This is a scripted response. Try clicking the pills below?";

export interface LogLine {
  who: string;
  text: string;
}

export type DemoStep =
  | { type: "flash"; part: PartId }
  | { type: "travel"; route: RouteKey; reverse?: boolean }
  | { type: "log"; line: LogLine };

const log = (who: string, text: string): DemoStep => ({
  type: "log",
  line: { who, text },
});
const flash = (part: PartId): DemoStep => ({ type: "flash", part });
const go = (route: RouteKey): DemoStep => ({ type: "travel", route });
const back = (route: RouteKey): DemoStep => ({
  type: "travel",
  route,
  reverse: true,
});

const SLOT_ROUTES = ["adp-ai0", "adp-ai1", "adp-ai2"] as const;
const SPECIALIST_ROUTES = ["sup-s0", "sup-s1", "sup-s2"] as const;
const MCP_ROUTES = ["s0-mcp", "s1-mcp", "s2-mcp"] as const;
const TOOL_ROUTES = ["mcp-t0", "mcp-t1", "mcp-t2"] as const;

/** The supervisor reads the intent through the adapter and the live platform. */
function classify(ask: Ask, platform: PlatformIndex): DemoStep[] {
  const slot = SLOT_ROUTES[platform];
  return [
    go("sup-adp"),
    flash("adp"),
    go(slot),
    flash("ai"),
    log("supervisor", `intent: ${ask.key} (platform ${PLATFORMS[platform]})`),
    back(slot),
    back("sup-adp"),
  ];
}

/** What happens once the message reaches the supervisor, by route. */
function beyondSupervisor(ask: Ask, platform: PlatformIndex): DemoStep[] {
  const { route } = ask;
  switch (route.reach) {
    case "supervisor":
      return [log("supervisor", "free text: scripted reply in this demo")];
    case "platform":
      return [...classify(ask, platform), log("supervisor", route.note)];
    case "specialist": {
      const specialist = SPECIALIST_ROUTES[route.lane];
      return [
        ...classify(ask, platform),
        go(specialist),
        flash("spec"),
        log(route.agent, route.note),
        back(specialist),
      ];
    }
    case "tools": {
      const specialist = SPECIALIST_ROUTES[route.lane];
      const mcp = MCP_ROUTES[route.lane];
      const tool = TOOL_ROUTES[route.lane];
      return [
        ...classify(ask, platform),
        go(specialist),
        flash("spec"),
        log(route.agent, `calls ${route.tool}`),
        go(mcp),
        flash("mcp"),
        go(tool),
        flash("tools"),
        log("mcp", `${route.tool} 200, 38 ms`),
        back(tool),
        back(mcp),
        back(specialist),
      ];
    }
    default:
      return [];
  }
}

/**
 * A message's round trip: widget, BFF and supervisor, then as far into the
 * figure as its route needs, and home again. The opening log line starts a
 * fresh trace; the last says how the BFF drew the reply.
 */
export function demoPlan(ask: Ask, platform: PlatformIndex): DemoStep[] {
  return [
    log("widget", "POST /chat"),
    flash("chat"),
    go("chat-bff"),
    flash("bff"),
    log("bff", "session ok, 4 ms"),
    go("bff-sup"),
    flash("sup"),
    ...beyondSupervisor(ask, platform),
    back("bff-sup"),
    back("chat-bff"),
    log("bff", ask.card ? "rendered as a rich card" : "rendered as a message"),
  ];
}

/** The hops a plan travels, as `route` or `route back`: the route table. */
export function hops(plan: DemoStep[]): string[] {
  return plan.flatMap((step) =>
    step.type === "travel"
      ? [`${step.route}${step.reverse ? " back" : ""}`]
      : [],
  );
}

/** The trace line when the platform is swapped. */
export function swapLine(platform: PlatformIndex): LogLine {
  return {
    who: "adapter",
    text: `backend switched to platform ${PLATFORMS[platform]}. No agent code changed.`,
  };
}
