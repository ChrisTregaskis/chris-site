/**
 * The scripted Wayfinder demo: which intent a question has, and the route a
 * message takes through the figure for it. Pure, so the choreography can be
 * tested without the animation.
 */
import { type RouteKey } from "./iso";
import { type PartId, PLATFORMS, type PlatformIndex } from "./parts";

export type IntentKey = "vehicle" | "booking" | "finance";

interface Intent {
  key: IntentKey;
  match: RegExp;
  agent: string;
  tool: string;
  /** Which specialist (and tool) handles it, left to right in the figure. */
  lane: 0 | 1 | 2;
}

export const INTENTS: readonly Intent[] = [
  {
    key: "vehicle",
    match: /suv|car|family|seat|find|hybrid/i,
    agent: "vehicle agent",
    tool: "inventory.search",
    lane: 0,
  },
  {
    key: "booking",
    match: /book|test|drive|appointment/i,
    agent: "booking agent",
    tool: "retailer.slots",
    lane: 1,
  },
  {
    key: "finance",
    match: /cost|month|finance|price|pay/i,
    agent: "finance agent",
    tool: "finance.quote",
    lane: 2,
  },
];

/** The intent a question reads as; anything unrecognised is a vehicle search. */
export function intentFor(question: string): Intent {
  return INTENTS.find((intent) => intent.match.test(question)) ?? INTENTS[0];
}

/** The quick questions offered under the chat. */
export const SUGGESTIONS = [
  { label: "Find me a family SUV", question: "Find me a family SUV" },
  { label: "Book a test drive", question: "Book a test drive" },
  { label: "Monthly cost?", question: "What would it cost a month?" },
] as const;

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

/**
 * A message's round trip: widget, BFF, supervisor, adapter, the live
 * platform and back, then the specialist, MCP and its tool, and home again.
 * The opening log line starts a fresh trace.
 */
export function demoPlan(intent: Intent, platform: PlatformIndex): DemoStep[] {
  const slot = SLOT_ROUTES[platform];
  const specialist = SPECIALIST_ROUTES[intent.lane];
  const mcp = MCP_ROUTES[intent.lane];
  const tool = TOOL_ROUTES[intent.lane];
  return [
    log("widget", "POST /chat"),
    flash("chat"),
    go("chat-bff"),
    flash("bff"),
    log("bff", "session ok, 4 ms"),
    go("bff-sup"),
    flash("sup"),
    go("sup-adp"),
    flash("adp"),
    go(slot),
    flash("ai"),
    log(
      "supervisor",
      `intent: ${intent.key} (platform ${PLATFORMS[platform]})`,
    ),
    back(slot),
    back("sup-adp"),
    go(specialist),
    flash("spec"),
    log(intent.agent, `calls ${intent.tool}`),
    go(mcp),
    flash("mcp"),
    go(tool),
    flash("tools"),
    log("mcp", `${intent.tool} 200, 38 ms`),
    back(tool),
    back(mcp),
    back(specialist),
    back("bff-sup"),
    back("chat-bff"),
  ];
}

/** The trace line when the platform is swapped. */
export function swapLine(platform: PlatformIndex): LogLine {
  return {
    who: "adapter",
    text: `backend switched to platform ${PLATFORMS[platform]}. No agent code changed.`,
  };
}
