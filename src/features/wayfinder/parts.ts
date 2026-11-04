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

/**
 * The story's steps, in scroll order: the board taken apart (step 1), the
 * nine parts (steps 2 to 10), then the live demo (step 11). Steps count from
 * 1 because 0 means "none selected yet"; what a visitor sees is each step's
 * numeral (`numeralForStep`): 00 for the intro, the part's own number, and
 * 10 for the demo.
 */
export const INTRO_STEP = 1;
export const DEMO_STEP = PART_ORDER.length + 2;

/** The part a step shows, or null for the intro, the demo and "none yet" (0). */
export function partForStep(step: number): PartId | null {
  return step > INTRO_STEP && step < DEMO_STEP ? PART_ORDER[step - 2] : null;
}

export function stepForPart(id: PartId): number {
  return PART_ORDER.indexOf(id) + 2;
}

/** A part's number (1 to 9). */
export function partNumber(id: PartId): number {
  return PART_ORDER.indexOf(id) + 1;
}

/** The number a step goes by: 0 for the intro, 1 to 9 for the parts, 10 for the demo. */
export function numeralForStep(step: number): number {
  return Math.max(0, step - 1);
}

/** The intro step: the board comes apart into its numbered pieces. */
export const INTRO = {
  name: "Taken apart",
  heading: "Nine parts, opened up",
  text: "Each part opens up as you reach it, its pieces numbered in the drawing and named in the text. It all goes back together for the live demo.",
} as const;

/** The picker's options: the intro, every part, then the demo. */
export const PICKER_OPTIONS = [
  { value: INTRO_STEP, numeral: 0, label: INTRO.name },
  ...PART_ORDER.map((id, index) => ({
    value: stepForPart(id),
    numeral: index + 1,
    label: PARTS[id].name,
    separated: index === 0,
  })),
  {
    value: DEMO_STEP,
    numeral: numeralForStep(DEMO_STEP),
    label: "Try it, live demo",
    separated: true,
  },
];
