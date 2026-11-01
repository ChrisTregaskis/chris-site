import { describe, expect, it } from "vitest";
import { demoPlan, intentFor, swapLine } from "./demo";

describe("Wayfinder demo script", () => {
  it("reads a question's intent, defaulting to a vehicle search", () => {
    expect(intentFor("Find me a family SUV").key).toBe("vehicle");
    expect(intentFor("Book a test drive").key).toBe("booking");
    expect(intentFor("What would it cost a month?").key).toBe("finance");
    expect(intentFor("Hello there").key).toBe("vehicle");
  });

  it("routes a message through the live platform, the specialist and its tool, and back", () => {
    const plan = demoPlan(intentFor("Book a test drive"), 2);
    const travels = plan.flatMap((step) =>
      step.type === "travel"
        ? [`${step.route}${step.reverse ? " back" : ""}`]
        : [],
    );
    expect(travels).toEqual([
      "chat-bff",
      "bff-sup",
      "sup-adp",
      "adp-ai2",
      "adp-ai2 back",
      "sup-adp back",
      "sup-s1",
      "s1-mcp",
      "mcp-t1",
      "mcp-t1 back",
      "s1-mcp back",
      "sup-s1 back",
      "bff-sup back",
      "chat-bff back",
    ]);
    const flashes = plan.flatMap((step) =>
      step.type === "flash" ? [step.part] : [],
    );
    expect(flashes).toEqual([
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

  it("traces what each hop did", () => {
    const lines = demoPlan(intentFor("Monthly cost?"), 0).flatMap((step) =>
      step.type === "log" ? [`${step.line.who}: ${step.line.text}`] : [],
    );
    expect(lines).toEqual([
      "widget: POST /chat",
      "bff: session ok, 4 ms",
      "supervisor: intent: finance (platform A)",
      "finance agent: calls finance.quote",
      "mcp: finance.quote 200, 38 ms",
    ]);
    expect(swapLine(1).text).toBe(
      "backend switched to platform B. No agent code changed.",
    );
  });
});
