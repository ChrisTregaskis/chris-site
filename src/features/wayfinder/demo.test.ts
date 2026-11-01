import { describe, expect, it } from "vitest";
import {
  demoPlan,
  FREE_TEXT,
  hops,
  SUGGESTIONS,
  type Suggestion,
  swapLine,
} from "./demo";

const pill = (key: Suggestion["key"]) => {
  const found = SUGGESTIONS.find((suggestion) => suggestion.key === key);
  if (!found) throw new Error(`no ${key} pill`);
  return found;
};

const flashes = (ask: Parameters<typeof demoPlan>[0]) =>
  demoPlan(ask, 1).flatMap((step) =>
    step.type === "flash" ? [step.part] : [],
  );

const lines = (ask: Parameters<typeof demoPlan>[0]) =>
  demoPlan(ask, 0).flatMap((step) =>
    step.type === "log" ? [`${step.line.who}: ${step.line.text}`] : [],
  );

describe("Wayfinder demo script", () => {
  it("sends free text to the supervisor and straight back", () => {
    expect(hops(demoPlan(FREE_TEXT, 2))).toEqual([
      "chat-bff",
      "bff-sup",
      "bff-sup back",
      "chat-bff back",
    ]);
    expect(flashes(FREE_TEXT)).toEqual(["chat", "bff", "sup"]);
    expect(lines(FREE_TEXT)).toEqual([
      "widget: POST /chat",
      "bff: session ok, 4 ms",
      "supervisor: free text: scripted reply in this demo",
      "bff: rendered as a message",
    ]);
  });

  describe("route table: each pill goes only as far as its question needs", () => {
    it("answers a general question from the model alone", () => {
      expect(hops(demoPlan(pill("explain"), 2))).toEqual([
        "chat-bff",
        "bff-sup",
        "sup-adp",
        "adp-ai2",
        "adp-ai2 back",
        "sup-adp back",
        "bff-sup back",
        "chat-bff back",
      ]);
      expect(flashes(pill("explain"))).toEqual([
        "chat",
        "bff",
        "sup",
        "adp",
        "ai",
      ]);
    });

    it("hands a test drive to the booking specialist, with nothing live to fetch yet", () => {
      expect(hops(demoPlan(pill("booking"), 0))).toEqual([
        "chat-bff",
        "bff-sup",
        "sup-adp",
        "adp-ai0",
        "adp-ai0 back",
        "sup-adp back",
        "sup-s1",
        "sup-s1 back",
        "bff-sup back",
        "chat-bff back",
      ]);
      expect(lines(pill("booking"))).toContain(
        "booking agent: asks for a model and postcode first",
      );
    });

    it("fetches live stock over MCP for a vehicle search", () => {
      expect(hops(demoPlan(pill("vehicle"), 1))).toEqual([
        "chat-bff",
        "bff-sup",
        "sup-adp",
        "adp-ai1",
        "adp-ai1 back",
        "sup-adp back",
        "sup-s0",
        "s0-mcp",
        "mcp-t0",
        "mcp-t0 back",
        "s0-mcp back",
        "sup-s0 back",
        "bff-sup back",
        "chat-bff back",
      ]);
      expect(flashes(pill("vehicle"))).toEqual([
        "chat",
        "bff",
        "sup",
        "adp",
        "ai",
        "spec",
        "mcp",
        "tools",
      ]);
    });

    it("fetches a live quote over MCP for monthly cost, and traces each hop", () => {
      expect(hops(demoPlan(pill("finance"), 0))).toContain("mcp-t2");
      expect(lines(pill("finance"))).toEqual([
        "widget: POST /chat",
        "bff: session ok, 4 ms",
        "supervisor: intent: finance (platform A)",
        "finance agent: calls finance.quote",
        "mcp: finance.quote 200, 38 ms",
        "bff: rendered as a rich card",
      ]);
    });

    it("sends at least one pill nowhere near MCP, and every route comes home", () => {
      const skipping = SUGGESTIONS.filter(
        (suggestion) => !flashes(suggestion).includes("mcp"),
      );
      expect(skipping.map((suggestion) => suggestion.key)).toEqual([
        "booking",
        "explain",
      ]);
      for (const ask of [...SUGGESTIONS, FREE_TEXT]) {
        const route = hops(demoPlan(ask, 1));
        const out = route.filter((hop) => !hop.endsWith(" back"));
        const home = route
          .filter((hop) => hop.endsWith(" back"))
          .map((hop) => hop.replace(" back", ""));
        expect(home.sort()).toEqual(out.sort());
        expect(route.at(-1)).toBe("chat-bff back");
      }
    });
  });

  it("says when the platform is swapped", () => {
    expect(swapLine(1).text).toBe(
      "backend switched to platform B. No agent code changed.",
    );
  });
});
