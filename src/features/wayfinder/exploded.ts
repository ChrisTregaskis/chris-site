/**
 * The exploded anatomy as data: each part split into numbered sub-components,
 * every one a few blocks in plan space (the same x, y, z, w, d, h the
 * isometric figure is drawn from), plus where it moves to when the figure
 * comes apart. Renderer-agnostic and pure: the 3D view builds its meshes from
 * it, and the assembled blocks reproduce today's figure.
 *
 * Plan space: x runs right-down the page, y left-down, z up; the cloud plate's
 * top is z = 0.
 */
import { type PartId } from "./parts";

export type Vec3 = readonly [number, number, number];

/** How a block is drawn. */
export type BlockKind =
  /** A part's own faces, in the figure palette. */
  | "body"
  /** A dark inset in the surface tone: sockets, screens, the eye. */
  | "inset"
  /** A flat cylinder; w is the radius, d is ignored. */
  | "disc";

export interface Block {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind?: BlockKind;
}

export interface SubComponent {
  /** Part number, e.g. "2.3". */
  id: string;
  label: string;
  blocks: Block[];
  /** Where it moves to when exploded, on top of the part's lift. */
  offset: Vec3;
  /** Only there while exploded (it is hidden under a part when assembled). */
  revealOnly?: boolean;
  /** Text drawn on it (a pad's name, a cartridge's letter). */
  tag?: string;
  /** The AI platform this cartridge is (the AI part only). */
  platform?: 0 | 1 | 2;
}

export interface ExplodedPart {
  id: PartId;
  /** How far the whole part rises when the figure comes apart. */
  lift: number;
  /** The cloud plate: drawn in the base palette, never lifts. */
  base?: boolean;
  subs: SubComponent[];
  /** Where the numbered badge's lead starts (assembled), top centre. */
  badgeAt: Vec3;
}

const b = (
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  kind?: BlockKind,
): Block => ({ x, y, z, w, d, h, kind });

/** The chat overlay's four outlined screens, as raised tiles on its front. */
const screens = [0, 1, 2, 3].map((i) => {
  const z = 78 - i * 17;
  const x0 = i % 2 ? 26 : 8;
  const x1 = i % 2 ? 62 : 44;
  return b(x0, 32, z - 10, x1 - x0, 1.6, 10, "inset");
});

/** A cartridge's seat in the adapter (x is its centre). */
const socket = (x: number) => b(x - 5, 8, 39.6, 10, 14, 1, "inset");

export const EXPLODED: readonly ExplodedPart[] = [
  {
    id: "cloud",
    base: true,
    lift: 0,
    badgeAt: [-50, 240, 0],
    subs: [
      {
        id: "9.1",
        label: "CDN",
        tag: "CDN",
        blocks: [b(-40, 175, 0, 70, 46, 4)],
        offset: [0, 0, 14],
      },
      {
        id: "9.2",
        label: "Managed secrets",
        tag: "secrets",
        blocks: [b(60, 175, 0, 70, 46, 4)],
        offset: [0, 0, 14],
      },
      {
        id: "9.3",
        label: "Containers",
        tag: "containers",
        blocks: [b(122, -8, 0, 216, 86, 4)],
        offset: [0, 0, 14],
        revealOnly: true,
      },
      {
        id: "9.4",
        label: "Terraform",
        blocks: [b(-60, -150, -14, 620, 410, 14)],
        offset: [0, 0, 0],
      },
    ],
  },
  {
    id: "chat",
    lift: 46,
    badgeAt: [35, 21, 100],
    subs: [
      {
        id: "1.1",
        label: "One-tag loader",
        blocks: [b(0, 10, 0, 70, 22, 12)],
        offset: [0, 0, 0],
      },
      {
        id: "1.2",
        label: "Shadow DOM shell",
        blocks: [b(0, 10, 12, 70, 10, 88)],
        offset: [0, -6, 22],
      },
      {
        id: "1.3",
        label: "Streamed message list",
        blocks: [b(0, 20, 12, 70, 7, 88)],
        offset: [0, 20, 22],
      },
      {
        id: "1.4",
        label: "Rich cards",
        blocks: [b(0, 27, 12, 70, 5, 88), ...screens],
        offset: [0, 46, 22],
      },
    ],
  },
  {
    id: "bff",
    lift: 64,
    badgeAt: [165, 35, 54],
    subs: [
      {
        id: "2.1",
        label: "Sessions",
        blocks: [b(130, 0, 34, 70, 70, 12), b(145, 15, 46, 40, 40, 8)],
        offset: [0, 0, 54],
      },
      {
        id: "2.2",
        label: "Rate limits",
        blocks: [b(130, 0, 24, 70, 70, 10)],
        offset: [0, 0, 36],
      },
      {
        id: "2.3",
        label: "PII redaction layer",
        blocks: [
          b(130, 0, 12, 70, 70, 12),
          ...[0, 1, 2, 3].map((i) =>
            b(138 + i * 15, 8, 23.6, 9, 54, 1, "inset"),
          ),
        ],
        offset: [0, 0, 18],
      },
      {
        id: "2.4",
        label: "Card shaper",
        blocks: [b(130, 0, 0, 70, 70, 12)],
        offset: [0, 0, 0],
      },
    ],
  },
  {
    id: "sup",
    lift: 84,
    badgeAt: [295, 35, 58],
    subs: [
      {
        id: "3.1",
        label: "Intent reader",
        blocks: [b(260, 0, 40, 70, 70, 18), b(295, 35, 57.6, 18, 0, 1, "disc")],
        offset: [0, 0, 40],
      },
      {
        id: "3.2",
        label: "Router",
        blocks: [
          b(260, 0, 18, 70, 70, 22),
          ...[277, 292, 307].map((x) => b(x, 69.6, 24, 6, 1, 9, "inset")),
        ],
        offset: [0, 0, 20],
      },
      {
        id: "3.3",
        label: "Next-step nudge",
        blocks: [b(260, 0, 0, 70, 70, 18)],
        offset: [0, 0, 0],
      },
    ],
  },
  {
    id: "spec",
    lift: 34,
    badgeAt: [250, 135, 36],
    subs: [235, 280, 325].map((x, i) => ({
      id: `4.${i + 1}`,
      label: [
        "Vehicles and electrification",
        "Test-drive booking (prototype)",
        "Finance (prototype)",
      ][i],
      blocks: [b(x, 120, 0, 30, 30, 36), b(x + 9, 129, 36, 12, 12, 5)],
      offset: [(i - 1) * 22, 18, i * 12] as const,
    })),
  },
  {
    id: "adp",
    lift: 74,
    badgeAt: [432, 52, 40],
    subs: [
      {
        id: "5.1",
        label: "Three sockets",
        blocks: [b(390, 0, 28, 84, 70, 12), ...[402, 432, 462].map(socket)],
        offset: [0, 0, 36],
      },
      {
        id: "5.2",
        label: "Config switch",
        blocks: [b(390, 0, 14, 84, 70, 14), b(474, 30, 17, 3, 16, 8)],
        offset: [0, 0, 18],
      },
      {
        id: "5.3",
        label: "One interface",
        blocks: [b(390, 0, 0, 84, 70, 14)],
        offset: [0, 0, 0],
      },
    ],
  },
  {
    id: "ai",
    lift: 116,
    badgeAt: [370, -120, 40],
    subs: ([0, 1, 2] as const).map((platform) => ({
      id: `6.${platform + 1}`,
      label: `Platform ${"ABC"[platform]}`,
      tag: "ABC"[platform],
      platform,
      blocks: [b(395 + platform * 30, -96, 0, 16, 46, 62)],
      offset: [(platform - 1) * 18, -10, 0] as const,
    })),
  },
  {
    id: "mcp",
    lift: 56,
    badgeAt: [425, 140, 62],
    subs: [
      {
        id: "7.1",
        label: "Tool registry",
        blocks: [b(400, 120, 52, 20, 40, 10), b(430, 120, 52, 20, 40, 10)],
        offset: [0, 0, 40],
      },
      {
        id: "7.2",
        label: "MCP transport",
        blocks: [b(390, 110, 20, 70, 60, 32)],
        offset: [0, 0, 20],
      },
      {
        id: "7.3",
        label: "Per-tool tests",
        blocks: [b(390, 110, 0, 70, 60, 20)],
        offset: [0, 0, 0],
      },
    ],
  },
  {
    id: "tools",
    lift: 30,
    badgeAt: [542, 140, 24],
    subs: [85, 125, 165].map((y, i) => ({
      id: `8.${i + 1}`,
      label: [
        "Vehicle search",
        "Retailer lookup (prototype)",
        "Finance quote (prototype)",
      ][i],
      blocks: [b(520, y, 0, 44, 30, 24), b(527, y + 6, 24, 30, 18, 3, "inset")],
      offset: [26, (i - 1) * 16, i * 12] as const,
    })),
  },
];

export const EXPLODED_BY_ID = Object.fromEntries(
  EXPLODED.map((part) => [part.id, part]),
) as Record<PartId, ExplodedPart>;

/** One knob for how far the whole assembly comes apart. */
export const EXPLODE_SCALE = 1.6;

/** How much higher the part being read floats, clear of the rest. */
export const FOCUS_LIFT = 34;

/** How much further a focused part's pieces spread than the others'. */
export const FOCUS_SPREAD = 0.7;

/**
 * Where a sub-component sits, as an offset from its assembled place.
 * `explode` (0 assembled, 1 apart) and `focus` (0 or 1, the selected part
 * spreading further) are the animation's progress values.
 */
export function subOffset(
  part: ExplodedPart,
  sub: SubComponent,
  explode: number,
  focus = 0,
): Vec3 {
  const spread = EXPLODE_SCALE * (1 + FOCUS_SPREAD * focus);
  const [dx, dy, dz] = sub.offset;
  return [
    dx * spread * explode,
    dy * spread * explode,
    (part.lift * EXPLODE_SCALE +
      dz * spread +
      (part.base ? 0 : FOCUS_LIFT * focus)) *
      explode,
  ];
}

export interface Bounds {
  min: Vec3;
  max: Vec3;
}

/** The axis-aligned bounds of some blocks (a disc's radius counts both ways). */
export function blockBounds(blocks: readonly Block[]): Bounds {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const block of blocks) {
    const disc = block.kind === "disc";
    const lo = disc
      ? [block.x - block.w, block.y - block.w, block.z]
      : [block.x, block.y, block.z];
    const hi = disc
      ? [block.x + block.w, block.y + block.w, block.z + block.h]
      : [block.x + block.w, block.y + block.d, block.z + block.h];
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], lo[axis]);
      max[axis] = Math.max(max[axis], hi[axis]);
    }
  }
  return {
    min: [min[0], min[1], min[2]],
    max: [max[0], max[1], max[2]],
  };
}
