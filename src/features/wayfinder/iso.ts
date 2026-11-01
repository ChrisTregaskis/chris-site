/**
 * Geometry for the Wayfinder figure: an isometric drawing of every part on a
 * cloud base plate, with the pipes a message travels along. Pure data, in the
 * SVG's user units (viewBox below), ported from the b3 prototype.
 */
import { PLATFORM_INDEXES, type PartId } from "./parts";

export type Point = readonly [number, number];

export const VIEW_BOX = "-290 -150 920 590";

const COS = 0.866;
const SIN = 0.5;

/** Project a point in plan (x, y) at height z onto the page. */
export function iso(x: number, y: number, z = 0): Point {
  return [(x - y) * COS, (x + y) * SIN - z];
}

const points = (list: Point[]) => list.map((p) => p.join(",")).join(" ");

export interface BoxFaces {
  left: string;
  right: string;
  top: string;
}

/** The three visible faces of a w×d×h block standing at (x, y, z). */
export function box(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
): BoxFaces {
  return {
    left: points([
      iso(x, y + d, z),
      iso(x + w, y + d, z),
      iso(x + w, y + d, z + h),
      iso(x, y + d, z + h),
    ]),
    right: points([
      iso(x + w, y, z),
      iso(x + w, y + d, z),
      iso(x + w, y + d, z + h),
      iso(x + w, y, z + h),
    ]),
    top: points([
      iso(x, y, z + h),
      iso(x + w, y, z + h),
      iso(x + w, y + d, z + h),
      iso(x, y + d, z + h),
    ]),
  };
}

export interface Badge {
  n: number;
  /** The dotted lead from the part up to the badge. */
  lead: { x1: number; y1: number; x2: number; y2: number };
  cx: number;
  cy: number;
}

/** A numbered badge floating 38 units above (x, y, z). */
export function badge(n: number, x: number, y: number, z: number): Badge {
  const [bx, by] = iso(x, y, z);
  const [tx, ty] = iso(x, y, z + 38);
  return { n, lead: { x1: bx, y1: by, x2: tx, y2: ty + 14 }, cx: tx, cy: ty };
}

export interface FigureLabel {
  x: number;
  y: number;
  text: string;
}

export interface FigurePart {
  id: PartId;
  /** The cloud plate, drawn in the base palette. */
  base?: boolean;
  boxes: BoxFaces[];
  /** Outlined screens on the chat overlay. */
  screens?: string[];
  /** Plug sockets on the adapter. */
  sockets?: string[];
  /** The supervisor's eye. */
  eye?: { cx: number; cy: number };
  labels?: FigureLabel[];
  badge: Badge;
}

const screen = (i: number) => {
  const y = 32;
  const z = 78 - i * 17;
  const x0 = i % 2 ? 26 : 8;
  const x1 = i % 2 ? 62 : 44;
  return points([
    iso(x0, y, z),
    iso(x1, y, z),
    iso(x1, y, z - 10),
    iso(x0, y, z - 10),
  ]);
};

const socket = (x: number) =>
  points([
    iso(x - 5, 8, 40),
    iso(x + 5, 8, 40),
    iso(x + 5, 22, 40),
    iso(x - 5, 22, 40),
  ]);

const pad = (x: number, y: number, text: string) => {
  const [lx, ly] = iso(x + 35, y + 23, 4);
  return { face: box(x, y, 0, 70, 46, 4), label: { x: lx, y: ly + 5, text } };
};

const cdn = pad(-40, 175, "CDN");
const secrets = pad(60, 175, "secrets");
const [eyeX, eyeY] = iso(295, 35, 58);

/** Every part except the AI platform cartridges, which are drawn as slots. */
export const FIGURE: Record<Exclude<PartId, "ai">, FigurePart> = {
  cloud: {
    id: "cloud",
    base: true,
    boxes: [box(-60, -150, -14, 620, 410, 14), cdn.face, secrets.face],
    labels: [cdn.label, secrets.label],
    badge: badge(9, -50, 240, 0),
  },
  chat: {
    id: "chat",
    boxes: [box(0, 10, 0, 70, 22, 100)],
    screens: [0, 1, 2, 3].map(screen),
    badge: badge(1, 35, 21, 100),
  },
  bff: {
    id: "bff",
    boxes: [box(130, 0, 0, 70, 70, 46), box(145, 15, 46, 40, 40, 8)],
    badge: badge(2, 165, 35, 54),
  },
  sup: {
    id: "sup",
    boxes: [box(260, 0, 0, 70, 70, 58)],
    eye: { cx: eyeX, cy: eyeY },
    badge: badge(3, 295, 35, 58),
  },
  spec: {
    id: "spec",
    boxes: [235, 280, 325].map((x) => box(x, 120, 0, 30, 30, 36)),
    badge: badge(4, 250, 135, 36),
  },
  adp: {
    id: "adp",
    boxes: [box(390, 0, 0, 84, 70, 40)],
    sockets: [402, 432, 462].map(socket),
    badge: badge(5, 432, 52, 40),
  },
  mcp: {
    id: "mcp",
    boxes: [
      box(390, 110, 0, 70, 60, 52),
      box(400, 120, 52, 20, 40, 10),
      box(430, 120, 52, 20, 40, 10),
    ],
    badge: badge(7, 425, 140, 62),
  },
  tools: {
    id: "tools",
    boxes: [85, 125, 165].map((y) => box(520, y, 0, 44, 30, 24)),
    badge: badge(8, 542, 140, 24),
  },
};

/** The three AI platform cartridges standing in the adapter, and their badge. */
export const SLOTS = PLATFORM_INDEXES.map((platform) => {
  const x = 395 + platform * 30;
  const [lx, ly] = iso(x + 8, -96, 62);
  return {
    platform,
    face: box(x, -96, 0, 16, 46, 62),
    label: { x: lx + 4, y: ly - 8, text: "ABC"[platform] },
  };
});
export const AI_BADGE = badge(6, 370, -120, 40);

/** Pipes between parts, as plan points; drawn and travelled 6 units up. */
export const ROUTES = {
  "chat-bff": [
    [70, 30],
    [130, 30],
  ],
  "bff-sup": [
    [200, 35],
    [260, 35],
  ],
  "sup-adp": [
    [330, 35],
    [395, 35],
  ],
  "adp-ai0": [
    [402, 0],
    [402, -50],
  ],
  "adp-ai1": [
    [432, 0],
    [432, -50],
  ],
  "adp-ai2": [
    [462, 0],
    [462, -50],
  ],
  "sup-s0": [
    [280, 70],
    [280, 95],
    [250, 95],
    [250, 120],
  ],
  "sup-s1": [
    [295, 70],
    [295, 120],
  ],
  "sup-s2": [
    [310, 70],
    [310, 95],
    [340, 95],
    [340, 120],
  ],
  "s0-mcp": [
    [250, 150],
    [250, 190],
    [425, 190],
    [425, 170],
  ],
  "s1-mcp": [
    [295, 150],
    [295, 190],
    [425, 190],
    [425, 170],
  ],
  "s2-mcp": [
    [340, 150],
    [340, 190],
    [425, 190],
    [425, 170],
  ],
  "mcp-t0": [
    [460, 125],
    [490, 125],
    [490, 100],
    [520, 100],
  ],
  "mcp-t1": [
    [460, 140],
    [520, 140],
  ],
  "mcp-t2": [
    [460, 155],
    [490, 155],
    [490, 180],
    [520, 180],
  ],
} as const satisfies Record<string, readonly (readonly [number, number])[]>;

export type RouteKey = keyof typeof ROUTES;
const isRouteKey = (key: string): key is RouteKey => key in ROUTES;
export const ROUTE_KEYS: RouteKey[] = Object.keys(ROUTES).filter(isRouteKey);

/** A route's points on the page, optionally reversed (the answer coming back). */
export function routePoints(key: RouteKey, reverse = false): Point[] {
  const projected = ROUTES[key].map(([x, y]) => iso(x, y, 6));
  return reverse ? projected.reverse() : projected;
}

/** SVG path data for a route. */
export function routePath(key: RouteKey): string {
  return `M${routePoints(key)
    .map((p) => p.join(","))
    .join(" L")}`;
}
