/**
 * The Wayfinder figure as an exploded assembly. Every part is split into
 * numbered sub-components, each a few plan-space boxes plus an offset for
 * "taken apart" and a further one for "in focus". Pure data and pure maths:
 * `layoutAt` turns the animated amounts into each piece's offset, the seating
 * axes and the paint order; `pipeRetract` says how far each pipe has drawn
 * off.
 *
 * Names stay at the level the site already discloses (each part's copy and
 * chips, the demo's trace): what a piece is for, never how it works.
 */
import {
  type Point,
  box,
  type BoxFaces,
  iso,
  type RouteKey,
  ROUTE_KEYS,
} from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { type Aabb, paintOrder } from "@/lib/isoDepth";

export type Vec3 = readonly [number, number, number];

export interface Box3 {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

/** Line art drawn on a piece's faces, moving with it. */
export type Detail =
  | { kind: "outline"; points: string; dashed?: boolean }
  | { kind: "inlay"; points: string }
  | { kind: "line"; points: string }
  | { kind: "eye"; cx: number; cy: number }
  | {
      kind: "text";
      x: number;
      y: number;
      text: string;
      /** Set above the piece rather than on its face. */
      above?: boolean;
    };

/**
 * Where a part's number tags line up, taken apart: in a column to its left or
 * right, in a row above or below it, or in front of it along the plan's x
 * axis (see `tags.ts`).
 */
export type TagSide = "left" | "right" | "above" | "below" | "front";

export interface SubComponent {
  /** Its part number, e.g. "2.3". */
  id: string;
  part: PartId;
  name: string;
  boxes: Box3[];
  details?: Detail[];
  /** Taken apart: its offset from where it seats, on top of the part's own. */
  apart: Vec3;
  /** In focus: a further offset, opening its part up. */
  focus: Vec3;
  /**
   * The seating axis, a dashed line drawn in the gap the piece leaves:
   * from `seat` (a point on the piece below, `on`, or on the plate) to `tip`
   * (a point on this piece), both where they sit assembled.
   */
  seat: Vec3;
  on?: string;
  tip: Vec3;
  /** Where its number tag lines up, if not where its part's do. */
  tag?: TagSide;
  /** Proven in the prototype only: drawn dashed while taken apart. */
  prototype?: boolean;
  /** An AI platform cartridge (part 6). */
  platform?: PlatformIndex;
}

interface PartPlan {
  /** Where the whole part goes when taken apart. */
  lift: Vec3;
  /** When it starts, 0 to 1 of the stagger (the plate upwards). */
  delay: number;
  /** The piece its numbered badge rides on (none: it stays on the plate). */
  badgeOn: string | null;
  /** Where its pieces' number tags line up, taken apart. */
  tags: TagSide;
  /** Where they line up on phones (opened in place), if not `tags`. */
  liteTags?: TagSide;
  /** Extra height for its badge while apart, to clear tall pieces. */
  badgeLift?: number;
}

// ---------------------------------------------------------------- helpers

const pts = (list: Point[]) => list.map((p) => p.join(",")).join(" ");
const b3 = (x: number, y: number, z: number, w: number, d: number, h: number) =>
  ({ x, y, z, w, d, h }) satisfies Box3;

/** A rectangle on a face facing +y (the left face), at plan depth y. */
const onFront = (y: number, x0: number, x1: number, z0: number, z1: number) =>
  pts([iso(x0, y, z0), iso(x1, y, z0), iso(x1, y, z1), iso(x0, y, z1)]);
/** A rectangle on a face facing +x (the right face), at plan x. */
const onSide = (x: number, y0: number, y1: number, z0: number, z1: number) =>
  pts([iso(x, y0, z0), iso(x, y1, z0), iso(x, y1, z1), iso(x, y0, z1)]);
/** A rectangle on a top face at height z. */
const onTop = (z: number, x0: number, x1: number, y0: number, y1: number) =>
  pts([iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)]);
const seg = (a: Vec3, b: Vec3) => pts([iso(...a), iso(...b)]);
const label = (at: Vec3, text: string, dy = 5): Detail => {
  const [x, y] = iso(...at);
  return { kind: "text", x, y: y + dy, text, above: dy < 0 };
};

/** A z-stack of slabs sharing a footprint, seated one on the next. */
function stackAxis(b: Box3) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.d / 2;
  return {
    seat: [cx, cy, b.z] as Vec3,
    tip: [cx, cy, b.z] as Vec3,
  };
}

// ------------------------------------------------------------------ parts

/** The chat bubbles on the message list's face (the b3 screens). */
const bubble = (i: number) => {
  const z = 78 - i * 17;
  const x0 = i % 2 ? 26 : 8;
  const x1 = i % 2 ? 62 : 44;
  return onFront(32, x0, x1, z - 10, z);
};

const chat: SubComponent[] = [
  {
    id: "1.1",
    part: "chat",
    name: "One-tag loader",
    boxes: [b3(24, 2, 0, 22, 8, 14)],
    details: [{ kind: "line", points: seg([29, 10, 7], [41, 10, 7]) }],
    apart: [0, -46, 0],
    focus: [0, -22, 0],
    seat: [35, 10, 7],
    tip: [35, 10, 7],
  },
  {
    id: "1.2",
    part: "chat",
    name: "Shadow DOM shell",
    boxes: [b3(0, 10, 0, 70, 12, 100)],
    details: [
      { kind: "outline", points: onFront(22, 5, 65, 5, 95), dashed: true },
    ],
    apart: [0, 0, 0],
    focus: [0, 0, 0],
    seat: [35, 10, 50],
    tip: [35, 10, 50],
  },
  {
    id: "1.4",
    part: "chat",
    name: "Rich cards",
    boxes: [b3(0, 22, 0, 70, 5, 100)],
    details: [
      { kind: "outline", points: onFront(27, 8, 62, 56, 90) },
      { kind: "inlay", points: onFront(27, 12, 32, 64, 82) },
      { kind: "line", points: seg([38, 27, 76], [56, 27, 76]) },
      { kind: "outline", points: onFront(27, 8, 62, 12, 46) },
      { kind: "inlay", points: onFront(27, 12, 32, 20, 38) },
      { kind: "line", points: seg([38, 27, 32], [56, 27, 32]) },
    ],
    apart: [0, 30, 0],
    focus: [0, 22, 0],
    seat: [35, 22, 50],
    on: "1.2",
    tip: [35, 22, 50],
  },
  {
    id: "1.3",
    part: "chat",
    name: "Streamed message list",
    boxes: [b3(0, 27, 0, 70, 5, 100)],
    details: [0, 1, 2, 3].map((i) => ({ kind: "outline", points: bubble(i) })),
    apart: [0, 60, 0],
    focus: [0, 44, 0],
    seat: [35, 27, 50],
    on: "1.4",
    tip: [35, 27, 50],
  },
];

const BFF = { x: 130, y: 0, w: 70, d: 70 };
const bffSlab = (z: number, h: number) => b3(BFF.x, BFF.y, z, BFF.w, BFF.d, h);
/** The PII layer's top face: a fine grille every personal detail passes. */
const grille: Detail[] = [8, 18, 28, 38, 48, 58].map((y) => ({
  kind: "line",
  points: seg([136, y + 2, 46], [194, y + 2, 46]),
}));
const bff: SubComponent[] = [
  {
    id: "2.1",
    part: "bff",
    name: "Sessions",
    boxes: [bffSlab(0, 16)],
    details: [140, 160, 180].map((x) => ({
      kind: "inlay",
      points: onFront(70, x, x + 12, 5, 11),
    })),
    apart: [0, 0, 0],
    focus: [0, 0, 0],
    ...stackAxis(bffSlab(0, 16)),
  },
  {
    id: "2.2",
    part: "bff",
    name: "Rate limits",
    boxes: [bffSlab(16, 12)],
    details: [0, 1, 2, 3, 4].map((i) => ({
      kind: "line",
      points: seg([200, 12 + i * 11, 19], [200, 12 + i * 11, 21 + i * 1.4]),
    })),
    apart: [0, 0, 20],
    focus: [0, 0, 14],
    ...stackAxis(bffSlab(16, 12)),
    on: "2.1",
  },
  {
    id: "2.3",
    part: "bff",
    name: "PII redaction layer",
    boxes: [bffSlab(28, 18)],
    details: grille,
    apart: [0, 0, 40],
    focus: [0, 0, 28],
    ...stackAxis(bffSlab(28, 18)),
    on: "2.2",
  },
  {
    id: "2.4",
    part: "bff",
    name: "Card shaper",
    boxes: [b3(145, 15, 46, 40, 40, 8)],
    apart: [0, 0, 62],
    focus: [0, 0, 44],
    ...stackAxis(b3(145, 15, 46, 40, 40, 8)),
    on: "2.3",
  },
];

const supSlab = (z: number, h: number) => b3(260, 0, z, 70, 70, h);
const [eyeX, eyeY] = iso(295, 35, 58);
const sup: SubComponent[] = [
  {
    id: "3.3",
    part: "sup",
    name: "Next-step nudge",
    boxes: [supSlab(0, 18)],
    details: [
      { kind: "line", points: seg([276, 70, 9], [304, 70, 9]) },
      {
        kind: "line",
        points: pts([iso(298, 70, 13), iso(304, 70, 9), iso(298, 70, 5)]),
      },
    ],
    apart: [0, 0, 0],
    focus: [0, 0, 0],
    ...stackAxis(supSlab(0, 18)),
  },
  {
    id: "3.2",
    part: "sup",
    name: "Router",
    boxes: [supSlab(18, 20)],
    details: [280, 295, 310].map((x) => ({
      kind: "inlay",
      points: onFront(70, x - 4, x + 4, 24, 32),
    })),
    apart: [0, 0, 18],
    focus: [0, 0, 14],
    ...stackAxis(supSlab(18, 20)),
    on: "3.3",
  },
  {
    id: "3.1",
    part: "sup",
    name: "Intent reader",
    boxes: [supSlab(38, 20)],
    details: [{ kind: "eye", cx: eyeX, cy: eyeY }],
    apart: [0, 0, 36],
    focus: [0, 0, 28],
    ...stackAxis(supSlab(38, 20)),
    on: "3.2",
  },
];

const SPEC_NAMES = [
  "Vehicles and electrification",
  "Test-drive booking (prototype)",
  "Finance (prototype)",
];
const spec: SubComponent[] = [235, 280, 325].map((x, i) => ({
  id: `4.${i + 1}`,
  part: "spec",
  name: SPEC_NAMES[i],
  // The agent, and on it the key to only its own tools.
  boxes: [b3(x, 120, 0, 30, 30, 36), b3(x + 9, 129, 36, 12, 12, 5)],
  apart: [(i - 1) * 18, 0, 0],
  focus: [(i - 1) * 10, 0, 18 + i * 10],
  seat: [x + 15, 135, 0],
  tip: [x + 15, 135, 0],
  prototype: i > 0,
}));

const adpSlab = (z: number, h: number) => b3(390, 0, z, 84, 70, h);
const socket = (x: number) => onTop(40, x - 5, x + 5, 8, 22);
const adp: SubComponent[] = [
  {
    id: "5.1",
    part: "adp",
    name: "One interface",
    boxes: [adpSlab(0, 22)],
    details: [{ kind: "line", points: seg([400, 70, 11], [464, 70, 11]) }],
    apart: [0, 0, 0],
    focus: [0, 0, 0],
    ...stackAxis(adpSlab(0, 22)),
  },
  {
    id: "5.2",
    part: "adp",
    name: "Config switch",
    boxes: [adpSlab(22, 8)],
    details: [
      { kind: "outline", points: onSide(474, 24, 46, 23.5, 28.5) },
      { kind: "inlay", points: onSide(474, 36, 44, 24, 28) },
    ],
    apart: [0, 0, 16],
    focus: [0, 0, 14],
    ...stackAxis(adpSlab(22, 8)),
    on: "5.1",
  },
  {
    id: "5.3",
    part: "adp",
    name: "Three sockets",
    boxes: [adpSlab(30, 10)],
    details: [402, 432, 462].map((x) => ({ kind: "inlay", points: socket(x) })),
    apart: [0, 0, 32],
    focus: [0, 0, 28],
    ...stackAxis(adpSlab(30, 10)),
    on: "5.2",
  },
];

const ai: SubComponent[] = ([0, 1, 2] as const).map((platform) => {
  const x = 395 + platform * 30;
  return {
    id: `6.${platform + 1}`,
    part: "ai",
    name: `Platform ${"ABC"[platform]}`,
    boxes: [b3(x, -96, 0, 16, 46, 62)],
    details: [label([x + 8, -96, 62], "ABC"[platform], -8)],
    apart: [(platform - 1) * 14, -10, 0],
    focus: [(platform - 1) * 16, -18, 10],
    seat: [x + 8, -73, 0],
    tip: [x + 8, -73, 0],
    platform,
  };
});

const mcpSlab = (z: number, h: number) => b3(390, 110, z, 70, 60, h);
const mcp: SubComponent[] = [
  {
    id: "7.3",
    part: "mcp",
    name: "Per-tool tests",
    boxes: [mcpSlab(0, 22)],
    details: [402, 422, 442].map((x) => ({
      kind: "line",
      points: pts([iso(x, 170, 12), iso(x + 3, 170, 8), iso(x + 9, 170, 16)]),
    })),
    apart: [0, 0, 0],
    focus: [0, 0, 0],
    ...stackAxis(mcpSlab(0, 22)),
  },
  {
    id: "7.2",
    part: "mcp",
    name: "MCP transport",
    boxes: [mcpSlab(22, 30)],
    details: [
      { kind: "line", points: seg([396, 170, 34], [454, 170, 34]) },
      { kind: "line", points: seg([396, 170, 40], [454, 170, 40]) },
    ],
    apart: [0, 0, 16],
    focus: [0, 0, 12],
    ...stackAxis(mcpSlab(22, 30)),
    on: "7.3",
  },
  {
    id: "7.1",
    part: "mcp",
    name: "Tool registry",
    boxes: [b3(400, 120, 52, 20, 40, 10), b3(430, 120, 52, 20, 40, 10)],
    apart: [0, 0, 32],
    focus: [0, 0, 26],
    seat: [425, 140, 52],
    on: "7.2",
    tip: [425, 140, 52],
  },
];

const TOOL_NAMES = [
  "Vehicle search",
  "Retailer lookup (prototype)",
  "Finance quote (prototype)",
];
const tools: SubComponent[] = [85, 125, 165].map((y, i) => ({
  id: `8.${i + 1}`,
  part: "tools",
  name: TOOL_NAMES[i],
  boxes: [b3(520, y, 0, 44, 30, 24)],
  // A typed schema: two fields on its top.
  details: [
    { kind: "line", points: seg([527, y + 10, 24], [552, y + 10, 24]) },
    { kind: "line", points: seg([527, y + 19, 24], [545, y + 19, 24]) },
  ],
  apart: [0, (i - 1) * 16, 0],
  focus: [0, (i - 1) * 12, 16 + i * 8],
  seat: [542, y + 15, 0],
  tip: [542, y + 15, 0],
  prototype: i > 0,
}));

const pad = (x: number, y: number, id: string, name: string, text: string) =>
  ({
    id,
    part: "cloud",
    name,
    boxes: [b3(x, y, 0, 64, 46, 4)],
    details: [label([x + 32, y + 23, 4], text)],
    apart: [0, 0, 0],
    focus: [0, 0, 12],
    seat: [x + 32, y + 23, 0],
    tip: [x + 32, y + 23, 0],
  }) satisfies SubComponent;

const cloud: SubComponent[] = [
  pad(-50, 175, "9.1", "CDN", "CDN"),
  pad(24, 175, "9.2", "Managed secrets", "secrets"),
  pad(98, 175, "9.3", "Containers", "containers"),
];

/** The plate is the cloud account itself: 9.4, everything as code. */
export const PLATE_BOX = b3(-60, -150, -14, 620, 410, 14);
export const PLATE = box(-60, -150, -14, 620, 410, 14);
export const PLATE_PIECE = { id: "9.4", name: "Terraform, the whole account" };

export const SUBS: SubComponent[] = [
  ...cloud,
  ...chat,
  ...bff,
  ...sup,
  ...spec,
  ...adp,
  ...ai,
  ...mcp,
  ...tools,
];

export const PLAN: Record<PartId, PartPlan> = {
  cloud: { lift: [0, 0, 10], delay: 0, badgeOn: null, tags: "front" },
  tools: { lift: [24, 0, 30], delay: 0.06, badgeOn: "8.1", tags: "below" },
  spec: { lift: [0, 26, 36], delay: 0.11, badgeOn: "4.1", tags: "below" },
  mcp: { lift: [10, 16, 54], delay: 0.16, badgeOn: "7.1", tags: "right" },
  chat: { lift: [-6, 14, 30], delay: 0.21, badgeOn: "1.2", tags: "above" },
  bff: { lift: [0, -4, 84], delay: 0.26, badgeOn: "2.4", tags: "left" },
  sup: { lift: [0, -8, 100], delay: 0.31, badgeOn: "3.1", tags: "right" },
  adp: { lift: [6, -10, 112], delay: 0.36, badgeOn: "5.3", tags: "right" },
  ai: {
    lift: [10, -24, 150],
    delay: 0.41,
    badgeOn: "6.1",
    tags: "above",
    badgeLift: 46,
  },
};

/** Sub-components by part, in part-number order (for lists). */
export const INSIDE: Record<PartId, { id: string; name: string }[]> =
  Object.fromEntries(
    PART_ORDER.map((part) => [
      part,
      [
        ...SUBS.filter((sub) => sub.part === part),
        ...(part === "cloud" ? [PLATE_PIECE] : []),
      ]
        .map(({ id, name }) => ({ id, name }))
        .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })),
    ]),
  ) as Record<PartId, { id: string; name: string }[]>;

// ------------------------------------------------------------- the layout

/**
 * The latest any piece starts, as a share of the whole run; each piece then
 * takes the rest of it. Parts go from the plate upwards; within a part the
 * piece that travels furthest goes first, so a stack opens from the top and
 * never runs a lower layer into the one above.
 */
export const MAX_DELAY = 0.5;
const WITHIN_PART = 0.03;

/** The animated amounts: taken apart (0 to 1) and each part's focus. */
export interface ExplodeAmounts {
  apart: number;
  focus: Readonly<Record<PartId, number>>;
  /** Phone-lite: only the part in focus comes apart. */
  lite: boolean;
}

/** An ease-out for each piece's run (the whole run is linear in time). */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

const reach = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

/** When each piece starts, 0 to MAX_DELAY. */
export const DELAY: ReadonlyMap<string, number> = new Map(
  PART_ORDER.flatMap((part) =>
    SUBS.filter((sub) => sub.part === part)
      .sort((a, b) => reach(b.apart) - reach(a.apart))
      .map((sub, rank) => [sub.id, PLAN[part].delay + rank * WITHIN_PART]),
  ),
);

/** A piece's own progress for the whole run's progress. */
export function pieceApart(apart: number, delay: number): number {
  const t = (apart - delay) / (1 - MAX_DELAY);
  return easeOut(Math.min(1, Math.max(0, t)));
}

const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [
  a[0] + b[0] * k,
  a[1] + b[1] * k,
  a[2] + b[2] * k,
];

/** How much a part not in focus closes up while another one is. */
const CLOSE_UP = 0.55;

/** A map entry that must exist (the data is static, so a miss is a bug). */
export function must<K, V>(map: ReadonlyMap<K, V>, key: K): V {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Missing ${String(key)}`);
  return value;
}

/** A plan-space offset as a page translation. */
export const project = ([dx, dy, dz]: Vec3): Point => [
  (dx - dy) * 0.866,
  (dx + dy) * 0.5 - dz,
];

const aabbOf = (boxes: Box3[], o: Vec3): Aabb => ({
  x0: Math.min(...boxes.map((b) => b.x)) + o[0],
  x1: Math.max(...boxes.map((b) => b.x + b.w)) + o[0],
  y0: Math.min(...boxes.map((b) => b.y)) + o[1],
  y1: Math.max(...boxes.map((b) => b.y + b.d)) + o[1],
  z0: Math.min(...boxes.map((b) => b.z)) + o[2],
  z1: Math.max(...boxes.map((b) => b.z + b.h)) + o[2],
});

const segmentAabb = (a: Vec3, b: Vec3): Aabb => ({
  x0: Math.min(a[0], b[0]),
  x1: Math.max(a[0], b[0]),
  y0: Math.min(a[1], b[1]),
  y1: Math.max(a[1], b[1]),
  z0: Math.min(a[2], b[2]),
  z1: Math.max(a[2], b[2]),
});

/** Lifted cartridges (not the live one) stand this much higher, as in b3. */
export const CARTRIDGE_LIFT = 22;

/** How far each AI platform cartridge is lifted, 0 (seated) to 1. */
export type CartridgeLifts = readonly [number, number, number];

/** Every cartridge lifted but the live one. */
export const liftsFor = (live: PlatformIndex): CartridgeLifts => [
  live === 0 ? 0 : 1,
  live === 1 ? 0 : 1,
  live === 2 ? 0 : 1,
];

/** One thing the painter sorts: a piece, or the axis in the gap below it. */
export type DrawItem = { kind: "piece" | "axis"; sub: SubComponent };

export const DRAW_ITEMS: DrawItem[] = [
  ...SUBS.map((sub) => ({ kind: "axis" as const, sub })),
  ...SUBS.map((sub) => ({ kind: "piece" as const, sub })),
];
export const itemKey = (item: DrawItem) => `${item.kind}:${item.sub.id}`;

export interface Layout {
  /** Each piece's plan-space offset from where it seats (a cartridge's lift included). */
  offset: Map<string, Vec3>;
  /** The same, before any cartridge's lift: what a badge riding it follows. */
  base: Map<string, Vec3>;
  /** Each seating axis, from seat to tip, in plan space. */
  axis: Map<string, [Vec3, Vec3]>;
  /** Indexes into DRAW_ITEMS, back to front. */
  order: number[];
  /** Every draw item's box, in DRAW_ITEMS order (for tests). */
  boxes: Aabb[];
}

/**
 * Where everything is for the given amounts, and the order to paint it.
 * `platform` is the live AI platform (the others' cartridges lifted), or how
 * far each cartridge is lifted while a swap is under way.
 */
export function layoutAt(
  amounts: ExplodeAmounts,
  platform: PlatformIndex | CartridgeLifts = 1,
): Layout {
  const lifts = typeof platform === "number" ? liftsFor(platform) : platform;
  const base = new Map<string, Vec3>();
  const offset = new Map<string, Vec3>();
  const apartOf = new Map<string, number>();
  const focusSum = Math.min(
    1,
    PART_ORDER.reduce((sum, part) => sum + amounts.focus[part], 0),
  );
  for (const sub of SUBS) {
    const plan = PLAN[sub.part];
    const focus = amounts.focus[sub.part];
    const each =
      pieceApart(amounts.apart, must(DELAY, sub.id)) *
      (amounts.lite ? focus : 1);
    // With another part in focus, a part keeps its tier but closes up a
    // little, so the one in focus stands out.
    const spread = amounts.lite ? 1 : 1 - CLOSE_UP * (focusSum - focus);
    // Phone-lite opens the part where it stands: the stage is too short for
    // the tiers.
    const lift = amounts.lite ? 0 : each;
    let o = add(add([0, 0, 0], plan.lift, lift), sub.apart, each * spread);
    o = add(o, sub.focus, focus * each);
    base.set(sub.id, o);
    offset.set(
      sub.id,
      sub.platform === undefined
        ? o
        : add(o, [0, 0, CARTRIDGE_LIFT * lifts[sub.platform]]),
    );
    apartOf.set(sub.id, each);
  }

  // An axis spans the gap a piece leaves, so a cartridge's own lift joins it
  // only as the piece comes apart (assembled, a lifted cartridge has none).
  const axis = new Map<string, [Vec3, Vec3]>();
  for (const sub of SUBS) {
    const from: Vec3 = sub.on ? must(base, sub.on) : [0, 0, 0];
    const raised =
      sub.platform === undefined
        ? 0
        : CARTRIDGE_LIFT * lifts[sub.platform] * must(apartOf, sub.id);
    axis.set(sub.id, [
      add(sub.seat, from),
      add(add(sub.tip, must(base, sub.id)), [0, 0, raised]),
    ]);
  }

  const boxes = DRAW_ITEMS.map(({ kind, sub }) => {
    if (kind === "axis") {
      const [a, b] = must(axis, sub.id);
      return segmentAabb(a, b);
    }
    return aabbOf(sub.boxes, must(offset, sub.id));
  });

  return { offset, base, axis, order: paintOrder(boxes), boxes };
}

/** A box's three faces (re-exported for the figure). */
export const facesOf = (b: Box3): BoxFaces => box(b.x, b.y, b.z, b.w, b.d, b.h);

/** The amounts once everything has settled: taken apart or not, `part` in focus. */
export function settled(
  part: PartId | null,
  lite: boolean,
  apart = true,
): ExplodeAmounts {
  const focus = Object.fromEntries(
    PART_ORDER.map((p) => [p, p === part ? 1 : 0]),
  ) as Record<PartId, number>;
  return { apart: apart ? 1 : 0, focus, lite };
}

// ------------------------------------------------------------------ pipes

/** The two parts each pipe joins. */
export const ROUTE_PARTS: Record<RouteKey, readonly [PartId, PartId]> = {
  "chat-bff": ["chat", "bff"],
  "bff-sup": ["bff", "sup"],
  "sup-adp": ["sup", "adp"],
  "adp-ai0": ["adp", "ai"],
  "adp-ai1": ["adp", "ai"],
  "adp-ai2": ["adp", "ai"],
  "sup-s0": ["sup", "spec"],
  "sup-s1": ["sup", "spec"],
  "sup-s2": ["sup", "spec"],
  "s0-mcp": ["spec", "mcp"],
  "s1-mcp": ["spec", "mcp"],
  "s2-mcp": ["spec", "mcp"],
  "mcp-t0": ["mcp", "tools"],
  "mcp-t1": ["mcp", "tools"],
  "mcp-t2": ["mcp", "tools"],
};

/** A pipe is fully drawn off once its parts are this far into coming apart. */
const PIPE_OFF_BY = 1 / 3;

/**
 * How far a part has come away from its seat, as far as its pipes care: the
 * whole run when every part comes apart, only its own focus on phones (where
 * just the part in focus opens).
 */
export function partOpen(amounts: ExplodeAmounts, part: PartId): number {
  return amounts.lite ? amounts.apart * amounts.focus[part] : amounts.apart;
}

/**
 * How far each pipe has drawn off, 0 (drawn) to 1 (gone): it goes as either
 * of its parts starts to lift, over the first third of the run, and draws
 * back on in the last third of coming back. A pipe whose parts both stay
 * seated (on a phone, any pipe away from the open part) stays drawn.
 */
export function pipeRetract(amounts: ExplodeAmounts): Record<RouteKey, number> {
  return Object.fromEntries(
    ROUTE_KEYS.map((key) => {
      const [a, b] = ROUTE_PARTS[key];
      const open = Math.max(partOpen(amounts, a), partOpen(amounts, b));
      return [key, Math.min(1, open / PIPE_OFF_BY)];
    }),
  ) as Record<RouteKey, number>;
}

// ----------------------------------------------------------------- bounds

/** A box's drawing on the page, offset by `o` (plan units). */
export function drawnBounds(b: Box3, o: Vec3 = [0, 0, 0]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const dx of [0, b.w]) {
    for (const dy of [0, b.d]) {
      for (const dz of [0, b.h]) {
        const [px, py] = iso(b.x + dx + o[0], b.y + dy + o[1], b.z + dz + o[2]);
        xs.push(px);
        ys.push(py);
      }
    }
  }
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

export type Bounds = ReturnType<typeof drawnBounds>;

export const unionBounds = (list: readonly Bounds[]): Bounds => ({
  left: Math.min(...list.map((b) => b.left)),
  right: Math.max(...list.map((b) => b.right)),
  top: Math.min(...list.map((b) => b.top)),
  bottom: Math.max(...list.map((b) => b.bottom)),
});

/** Where a part's numbered badge is drawn for the given amounts (its centre). */
export function badgeOffset(
  part: PartId,
  layout: Layout,
  amounts: ExplodeAmounts,
): Vec3 {
  const on = PLAN[part].badgeOn;
  if (!on) return [0, 0, 0];
  const extra =
    (PLAN[part].badgeLift ?? 0) *
    pieceApart(amounts.apart, must(DELAY, on)) *
    (amounts.lite ? 0 : 1);
  return add(must(layout.base, on), [0, 0, extra]);
}
