/** Wayfinder's parts, in the order the scroll story walks through them. */
export const PART_ORDER = [
  "chat",
  "bff",
  "sup",
  "spec",
  "adp",
  "ai",
  "mcp",
  "tools",
  "cloud",
] as const;

export type PartId = (typeof PART_ORDER)[number];

export interface Part {
  name: string;
  heading: string;
  text: string;
  stack: string[];
}

export const PARTS: Record<PartId, Part> = {
  chat: {
    name: "Chat overlay",
    heading: "A chat bubble on the brand's site",
    text: "An embeddable React overlay that drops into the brand's existing site with one script tag. It streams replies and draws rich cards for cars, slots and prices.",
    stack: ["React", "TypeScript", "Vite", "Shadow DOM"],
  },
  bff: {
    name: "API server (BFF)",
    heading: "An API layer in front of everything",
    text: "A Node API between the widget and the agents. It owns sessions and rate limits, and turns agent output into cards the widget knows how to draw. A PII layer redacts personal details before anything reaches a model.",
    stack: ["Node", "Hono", "Zod"],
  },
  sup: {
    name: "Supervisor agent",
    heading: "A supervisor reads the message",
    text: "It works out what the buyer wants, routes them to the right specialist and nudges them towards a sensible next step.",
    stack: ["Multi-agent routing", "Prompted classifiers"],
  },
  spec: {
    name: "Specialist agents",
    heading: "Specialists do the answering",
    text: "Narrow agents for vehicles and electrification, with test-drive booking and finance proven in the prototype. Each one only sees the tools it needs, which keeps answers grounded.",
    stack: ["Agents", "Tool calling"],
  },
  adp: {
    name: "Provider adapter",
    heading: "One interface over the AI platform",
    text: "The adapter hides which model backend is behind it. Changing platform is config, not a rewrite, and no agent code changes.",
    stack: ["TypeScript interfaces", "Config-driven"],
  },
  ai: {
    name: "AI platforms",
    heading: "The platform is swappable",
    text: "Interchangeable model backends. Wayfinder launched on one and was built so it never has to care which. Swap it here, or click a cartridge in the figure.",
    stack: [],
  },
  mcp: {
    name: "MCP server",
    heading: "Tools arrive over MCP",
    text: "Vehicle APIs exposed as tools over the Model Context Protocol, so any agent can call them and each one is testable on its own. In the prototype, booking and finance plugged in the same way.",
    stack: ["MCP SDK", "TypeScript"],
  },
  tools: {
    name: "Tools",
    heading: "Thin wrappers over real services",
    text: "Small, typed wrappers over the brand's existing vehicle services. In the prototype, retailer and finance services were wrapped the same way.",
    stack: ["REST", "Zod schemas"],
  },
  cloud: {
    name: "Cloud, as code",
    heading: "All of it, as code",
    text: "Everything runs in one cloud account, provisioned with Terraform: a CDN for the widget, managed secrets and containers for the API.",
    stack: ["Terraform", "CDN", "Secrets", "Containers"],
  },
};

export const PLATFORMS = ["A", "B", "C"] as const;
export const PLATFORM_INDEXES = [0, 1, 2] as const;
export type PlatformIndex = (typeof PLATFORM_INDEXES)[number];

/** Steps 1 to 9 are the parts; step 10 is the live demo. */
export const DEMO_STEP = PART_ORDER.length + 1;

/** The part a step shows, or null for the demo (and for "none yet", 0). */
export function partForStep(step: number): PartId | null {
  return step >= 1 && step <= PART_ORDER.length ? PART_ORDER[step - 1] : null;
}

export function stepForPart(id: PartId): number {
  return PART_ORDER.indexOf(id) + 1;
}

/** The picker's options: every part, then the demo. */
export const PICKER_OPTIONS = [
  ...PART_ORDER.map((id, index) => ({
    value: index + 1,
    label: PARTS[id].name,
  })),
  { value: DEMO_STEP, label: "Try it, live demo", separated: true },
];
