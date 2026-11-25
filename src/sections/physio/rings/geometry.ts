import { type XY } from "@/lib/polyline";

/*
 * The physio rings, from above: Postgres at the centre inside its policy;
 * the functions on an orbit inside the private network's ring; the edge
 * services (the API, the CDN, sign-in, video storage) outside it; and the
 * people and the schedule furthest out. Plan space is centred on the data,
 * in viewBox units; angles are in degrees, clockwise from three o'clock (as
 * SVG draws them). Pure, so the layout can be tested without a browser.
 */

/** The drawing's frame: a square centred on the data. */
export const HALF = 210;
export const VIEW_BOX = `${-HALF} ${-HALF} ${HALF * 2} ${HALF * 2}`;

export const R = {
  /** Where the people and the schedule stand. */
  actor: 176,
  /** The edge services. */
  edge: 146,
  /** The private network's wall. */
  net: 116,
  /** The functions' orbit. */
  orbit: 88,
  /** The row-level security policy. */
  policy: 62,
  /** Postgres itself. */
  data: 44,
} as const;

/**
 * Type on the drawing, in viewBox units. On a phone the drawing is as wide
 * as the screen (but never taller than 56% of it), so at 320px wide a unit
 * is 320 / 420 of a pixel and 17.5 units is just over 13px. Wider screens
 * set it a size down (`LABEL_CLASS`), never below about 13px either.
 */
export const LABEL_UNITS = 17.5;
/** The narrowest phone the type is checked at, and the drawing's width there. */
export const NARROWEST_PX = 320;

/**
 * The compact phone stage (`features/phone-stage`): the frame cropped to
 * what's drawn (the square's empty band under the rings gone), so the
 * drawing can be shorter for its width, and its labels a touch larger, as
 * the drawing is smaller there: never under `minPx` wide, so the labels
 * stay 12px or more. The ring names keep their size: any larger, the
 * policy's would run into the health check on the orbit.
 */
export const COMPACT = {
  top: -212,
  bottom: 158,
  labelUnits: 18.5,
  minPx: 280,
} as const;
export const COMPACT_VIEW_BOX = `${-HALF} ${COMPACT.top} ${HALF * 2} ${COMPACT.bottom - COMPACT.top}`;

export function polar(r: number, degrees: number): XY {
  const a = (degrees * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

export const ANGLE = {
  top: -90,
  signIn: -132,
  cdn: -48,
  storage: -8,
  health: 55,
  noRoute: 25,
  runner: -158,
  sweeper: -178,
  schedule: -168,
  engineer: 138,
} as const;

export type NodeId =
  | "visitor"
  | "api"
  | "signIn"
  | "cdn"
  | "storage"
  | "fnRequest"
  | "fnVideo"
  | "fnHealth"
  | "schedule"
  | "runner"
  | "sweeper"
  | "engineer"
  | "gate"
  | "host"
  | "endpointSignIn"
  | "endpointStorage"
  | "noRoute"
  | "policy"
  | "data";

/** What a node is drawn as: a person or service outside, a function on the orbit, or a mark on a wall. */
export type NodeKind = "actor" | "edge" | "orbit" | "wall" | "ring" | "centre";

export interface RingNode {
  id: NodeId;
  kind: NodeKind;
  at: XY;
}

const node = (id: NodeId, kind: NodeKind, r: number, a: number): RingNode => ({
  id,
  kind,
  at: polar(r, a),
});

export const NODES: Record<NodeId, RingNode> = {
  visitor: node("visitor", "actor", R.actor, ANGLE.top),
  api: node("api", "edge", R.edge, ANGLE.top),
  signIn: node("signIn", "edge", R.edge, ANGLE.signIn),
  cdn: node("cdn", "edge", R.edge, ANGLE.cdn),
  storage: node("storage", "edge", R.edge, ANGLE.storage),
  fnRequest: node("fnRequest", "orbit", R.orbit, ANGLE.top),
  fnVideo: node("fnVideo", "orbit", R.orbit, ANGLE.cdn),
  fnHealth: node("fnHealth", "orbit", R.orbit, ANGLE.health),
  schedule: node("schedule", "actor", R.actor, ANGLE.schedule),
  runner: node("runner", "orbit", R.orbit, ANGLE.runner),
  sweeper: node("sweeper", "orbit", R.orbit, ANGLE.sweeper),
  engineer: node("engineer", "actor", R.actor, ANGLE.engineer),
  gate: node("gate", "wall", R.net, ANGLE.engineer),
  host: node("host", "orbit", R.orbit, ANGLE.engineer),
  endpointSignIn: node("endpointSignIn", "wall", R.net, ANGLE.signIn),
  endpointStorage: node("endpointStorage", "wall", R.net, ANGLE.storage),
  noRoute: node("noRoute", "wall", R.net, ANGLE.noRoute),
  policy: node("policy", "ring", R.policy, ANGLE.top),
  data: node("data", "centre", 0, 0),
};

/** A node's drawn radius (its disc), for spacing and for where lines stop. */
export function nodeRadius(kind: NodeKind): number {
  switch (kind) {
    case "actor":
      return 13;
    case "edge":
      return 13;
    case "orbit":
      return 11;
    case "wall":
      return 10;
    case "ring":
      return 0;
    case "centre":
      return R.data;
    default:
      return 0;
  }
}

/** Points along an arc of radius `r`, from one angle to another, every few degrees. */
export function arcPoints(r: number, from: number, to: number): XY[] {
  const steps = Math.max(1, Math.ceil(Math.abs(to - from) / 3));
  return Array.from({ length: steps + 1 }, (_, i) =>
    polar(r, from + ((to - from) * i) / steps),
  );
}

/** Points along a spoke at angle `a`, from one radius to another. */
export function spokePoints(a: number, from: number, to: number): XY[] {
  return [polar(from, a), polar(to, a)];
}

/** Joins legs into one route, dropping each repeated joint. */
function legs(...parts: XY[][]): XY[] {
  return parts.flatMap((part, index) => (index === 0 ? part : part.slice(1)));
}

export const ROUTE_KEYS = [
  "visitor-signIn",
  "visitor-api",
  "visitor-cdn",
  "cdn-storage",
  "api-fn",
  "fn-data",
  "fn-policy",
  "fn-video",
  "fn-signIn",
  "fn-storage",
  "schedule-runner",
  "runner-data",
  "schedule-sweeper",
  "sweeper-data",
  "engineer-host",
  "host-data",
  "fn-noRoute",
] as const;

export type RouteKey = (typeof ROUTE_KEYS)[number];

const at = (id: NodeId) => NODES[id].at;

/**
 * Every route, as points from its first node to its last. Arcs keep to
 * their ring and spokes to their angle, so the drawing reads as rings; a
 * route that reaches Postgres stops at the disc's edge.
 */
export const ROUTES: Record<RouteKey, XY[]> = {
  "visitor-signIn": legs(
    arcPoints(R.actor, ANGLE.top, ANGLE.signIn),
    spokePoints(ANGLE.signIn, R.actor, R.edge),
  ),
  "visitor-api": spokePoints(ANGLE.top, R.actor, R.edge),
  "visitor-cdn": legs(
    arcPoints(R.actor, ANGLE.top, ANGLE.cdn),
    spokePoints(ANGLE.cdn, R.actor, R.edge),
  ),
  "cdn-storage": arcPoints(R.edge, ANGLE.cdn, ANGLE.storage),
  "api-fn": spokePoints(ANGLE.top, R.edge, R.orbit),
  "fn-data": spokePoints(ANGLE.top, R.orbit, R.data),
  "fn-policy": spokePoints(ANGLE.top, R.orbit, R.policy),
  "fn-video": arcPoints(R.orbit, ANGLE.top, ANGLE.cdn),
  "fn-signIn": legs(
    arcPoints(R.orbit, ANGLE.top, ANGLE.signIn),
    spokePoints(ANGLE.signIn, R.orbit, R.edge),
  ),
  "fn-storage": legs(
    arcPoints(R.orbit, ANGLE.cdn, ANGLE.storage),
    spokePoints(ANGLE.storage, R.orbit, R.edge),
  ),
  "schedule-runner": [at("schedule"), at("runner")],
  "runner-data": spokePoints(ANGLE.runner, R.orbit, R.data),
  "schedule-sweeper": [at("schedule"), at("sweeper")],
  "sweeper-data": spokePoints(ANGLE.sweeper, R.orbit, R.data),
  "engineer-host": spokePoints(ANGLE.engineer, R.actor, R.orbit),
  "host-data": spokePoints(ANGLE.engineer, R.orbit, R.data),
  "fn-noRoute": spokePoints(ANGLE.noRoute, R.orbit, R.net),
};

/** A route's points, end to start when travelled back. */
export function routePoints(key: RouteKey, reverse = false): XY[] {
  const points = ROUTES[key];
  return reverse ? [...points].reverse() : points;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** A route as an SVG path. */
export function routePath(key: RouteKey): string {
  return ROUTES[key]
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join(" ");
}

/** An arc's SVG path, for the ring labels (`sweep` 0: right to left along the bottom). */
export function arcPath(r: number, from: number, to: number): string {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  const sweep = to > from ? 1 : 0;
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${round(x1)} ${round(y1)} A${r} ${r} 0 ${large} ${sweep} ${round(x2)} ${round(y2)}`;
}

export type Anchor = "start" | "middle" | "end";

export interface NodeLabel {
  node: NodeId;
  lines: readonly string[];
  /** Where the text's anchor sits, and which way it runs from there. */
  x: number;
  y: number;
  anchor: Anchor;
}

/** The labels beside the outer nodes; the orbit's functions carry icons instead. */
export const LABELS: readonly NodeLabel[] = [
  {
    node: "visitor",
    lines: ["Visitor"],
    x: 0,
    y: -R.actor - 19,
    anchor: "middle",
  },
  { node: "api", lines: ["API"], x: 18, y: -R.edge + 6, anchor: "start" },
  {
    node: "signIn",
    lines: ["Sign-in"],
    x: at("signIn")[0] - 18,
    y: at("signIn")[1] + 6,
    anchor: "end",
  },
  {
    node: "cdn",
    lines: ["CDN"],
    x: at("cdn")[0] + 18,
    y: at("cdn")[1] + 6,
    anchor: "start",
  },
  {
    node: "storage",
    lines: ["Video", "storage"],
    x: at("storage")[0],
    y: at("storage")[1] + 13 + LABEL_UNITS,
    anchor: "middle",
  },
  {
    node: "schedule",
    lines: ["Schedule"],
    x: -HALF + 8,
    y: at("schedule")[1] - 20,
    anchor: "start",
  },
  {
    node: "engineer",
    lines: ["Engineer"],
    x: at("engineer")[0],
    y: at("engineer")[1] + 13 + LABEL_UNITS,
    anchor: "middle",
  },
];

/** The ring labels, set along the bottom of each ring, one inside the next. */
export const RING_LABELS = [
  { id: "policy", text: "RLS policy", r: 82, from: 123, to: 57 },
  { id: "orbit", text: "Functions", r: 110, from: 113, to: 67 },
  { id: "net", text: "Private network", r: 137, from: 121, to: 59 },
] as const;

/**
 * A label's rough box, for checking it stays in the frame and clear of the
 * rest: Figtree's average advance is a little over half an em. Set in
 * `units` (the compact stage's are larger), from the same anchor.
 */
export function labelBox(
  label: NodeLabel,
  units: number = LABEL_UNITS,
): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const width =
    Math.max(...label.lines.map((line) => line.length)) * units * 0.58;
  const left =
    label.anchor === "start"
      ? label.x
      : label.anchor === "end"
        ? label.x - width
        : label.x - width / 2;
  return {
    left,
    right: left + width,
    top: label.y - units * 0.75,
    // Lines are 1.1em apart, so they spread with the type.
    bottom: label.y + (label.lines.length - 1) * units * 1.1 + units * 0.25,
  };
}
