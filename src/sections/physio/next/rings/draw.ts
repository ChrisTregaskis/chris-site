import {
  arcPoints,
  NODES,
  type NodeId,
  R,
  type RouteKey,
  ROUTES,
} from "./geometry";
import { type StepId } from "./story";
import { polylineLength, type XY } from "@/lib/polyline";

/*
 * How each step draws its part of the rings, as if by hand: lines draw on
 * along their length, and each icon fades in as its line reaches it. Pure,
 * so the order can be tested without a browser. A step's drawing runs on one
 * progress, 0 to 1; undrawing runs the same timeline backwards, so the last
 * thing drawn is the first to go, and an icon fades out as its line retracts
 * past it.
 */

/** A ring drawn as a line: from twelve o'clock, clockwise. */
export type RingStroke = "ring:net" | "ring:orbit" | "ring:policy";
export type StrokeKey = RouteKey | RingStroke;

/** Things that fade rather than draw: the nodes, and a few washes and labels. */
export type FadeKey =
  | NodeId
  | "net-fill"
  | "label:net"
  | "label:orbit"
  | "label:policy"
  | "tokens";

const RING_RADIUS: Record<RingStroke, number> = {
  "ring:net": R.net,
  "ring:orbit": R.orbit,
  "ring:policy": R.policy,
};

/** A ring's points, from twelve o'clock round, clockwise. */
export function ringPoints(ring: RingStroke): XY[] {
  return arcPoints(RING_RADIUS[ring], -90, 270);
}

const isRing = (key: StrokeKey): key is RingStroke => key in RING_RADIUS;

const strokePoints = (key: StrokeKey): XY[] =>
  isRing(key) ? ringPoints(key) : ROUTES[key];

/**
 * How far along a line a point is, 0 to 1: the nearest place on it. A node
 * is drawn where its line passes, so this is when the line reaches it.
 */
export function fractionAlong(points: readonly XY[], [px, py]: XY): number {
  const total = polylineLength(points);
  let walked = 0;
  let best = { distance: Infinity, at: 0 };
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy);
    const t =
      length === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length ** 2),
          );
    const distance = Math.hypot(ax + dx * t - px, ay + dy * t - py);
    if (distance < best.distance) {
      best = { distance, at: walked + length * t };
    }
    walked += length;
  }
  return total === 0 ? 0 : best.at / total;
}

/** A line, and what it waits for: the start, a node appearing, or another line finishing. */
interface StrokeSpec {
  stroke: StrokeKey;
  after?: NodeId | StrokeKey;
  /** Rings sweep round faster than routes travel. */
  speed?: number;
}

/**
 * A fade, and what brings it in: the start or the end of the step, a line
 * reaching it (a node on that line), a line setting off, or a line done.
 */
type FadeSpec =
  | { fade: FadeKey; at: "start" | "end" }
  | { fade: NodeId; on: StrokeKey }
  | { fade: FadeKey; with: StrokeKey }
  | { fade: FadeKey; once: StrokeKey };

type Spec = StrokeSpec | FadeSpec;

const RING_SPEED = 3;

/** Each step's drawing, in its own order. */
const SPECS: Record<StepId, readonly Spec[]> = {
  edge: [
    { fade: "visitor", at: "start" },
    { stroke: "visitor-api", after: "visitor" },
    { stroke: "visitor-signIn", after: "visitor" },
    { stroke: "visitor-cdn", after: "visitor" },
    { fade: "api", on: "visitor-api" },
    { fade: "signIn", on: "visitor-signIn" },
    { fade: "cdn", on: "visitor-cdn" },
    { stroke: "cdn-storage", after: "cdn" },
    { fade: "storage", on: "cdn-storage" },
  ],
  network: [
    { stroke: "ring:net", speed: RING_SPEED },
    { stroke: "ring:orbit", speed: RING_SPEED },
    { fade: "net-fill", with: "ring:net" },
    { fade: "endpointStorage", on: "ring:net" },
    { fade: "noRoute", on: "ring:net" },
    { fade: "endpointSignIn", on: "ring:net" },
    { fade: "label:net", once: "ring:net" },
    { stroke: "fn-storage", after: "ring:orbit" },
    { stroke: "fn-noRoute", after: "ring:orbit" },
    { stroke: "fn-signIn", after: "ring:orbit" },
  ],
  functions: [
    { stroke: "api-fn" },
    { fade: "fnRequest", on: "api-fn" },
    { fade: "label:orbit", once: "api-fn" },
    { stroke: "fn-video", after: "fnRequest" },
    { fade: "fnVideo", on: "fn-video" },
    { fade: "fnHealth", at: "end" },
  ],
  centre: [
    { stroke: "fn-data" },
    { fade: "policy", on: "fn-data" },
    { stroke: "ring:policy", after: "policy", speed: RING_SPEED },
    { fade: "label:policy", once: "ring:policy" },
    { fade: "data", on: "fn-data" },
  ],
  queue: [
    { fade: "schedule", at: "start" },
    { stroke: "schedule-runner", after: "schedule" },
    { stroke: "schedule-sweeper", after: "schedule" },
    { fade: "runner", on: "schedule-runner" },
    { fade: "sweeper", on: "schedule-sweeper" },
    { stroke: "runner-data", after: "runner" },
    { stroke: "sweeper-data", after: "sweeper" },
    { fade: "tokens", once: "runner-data" },
  ],
  admin: [
    { fade: "admin", at: "start" },
    { stroke: "admin-host", after: "admin" },
    { fade: "gate", on: "admin-host" },
    { fade: "host", on: "admin-host" },
    { stroke: "host-data", after: "host" },
  ],
};

/** How long a fade takes, as a share of its step's drawing. */
export const FADE_SPAN = 0.125;

export interface StrokeTiming {
  key: StrokeKey;
  start: number;
  end: number;
}

export interface FadeTiming {
  key: FadeKey;
  /** When the fade starts: before this, it isn't there at all. */
  at: number;
  /** For a node: how far along its line it sits, and which line. */
  on?: { stroke: StrokeKey; fraction: number };
}

export interface DrawPlan {
  strokes: readonly StrokeTiming[];
  fades: readonly FadeTiming[];
}

function planFor(step: StepId): DrawPlan {
  const strokes = new Map<string, { start: number; end: number }>();
  const fades = new Map<string, FadeTiming>();
  const endFades: FadeKey[] = [];
  // Times in plan units (a unit of line drawn at speed 1), scaled at the end.
  const whenReady = (key: string): number => {
    const stroke = strokes.get(key);
    if (stroke) return stroke.end;
    const fade = fades.get(key);
    if (fade) return fade.at;
    throw new Error(`${step}: ${key} isn't drawn before it's needed`);
  };
  const line = (key: StrokeKey) => {
    const timing = strokes.get(key);
    if (!timing) throw new Error(`${step}: ${key} isn't drawn`);
    return timing;
  };
  for (const spec of SPECS[step]) {
    if ("stroke" in spec) {
      const start = spec.after ? whenReady(spec.after) : 0;
      const length =
        polylineLength(strokePoints(spec.stroke)) / (spec.speed ?? 1);
      strokes.set(spec.stroke, { start, end: start + length });
    } else if ("on" in spec) {
      const { start, end } = line(spec.on);
      const fraction = fractionAlong(
        strokePoints(spec.on),
        NODES[spec.fade].at,
      );
      fades.set(spec.fade, {
        key: spec.fade,
        at: start + (end - start) * fraction,
        on: { stroke: spec.on, fraction },
      });
    } else if ("with" in spec) {
      fades.set(spec.fade, { key: spec.fade, at: line(spec.with).start });
    } else if ("once" in spec) {
      fades.set(spec.fade, { key: spec.fade, at: line(spec.once).end });
    } else if (spec.at === "start") {
      fades.set(spec.fade, { key: spec.fade, at: 0 });
    } else {
      endFades.push(spec.fade);
    }
  }
  const total = Math.max(
    1,
    ...[...strokes.values()].map((s) => s.end),
    ...[...fades.values()].map((f) => f.at),
  );
  for (const key of endFades) fades.set(key, { key, at: total });
  // Every line finished, and every fade with room to finish, by 1.
  const scale = (1 - FADE_SPAN) / total;
  const at = (t: number) => Math.round(t * scale * 1e6) / 1e6;
  return {
    strokes: SPECS[step].flatMap((spec) => {
      if (!("stroke" in spec)) return [];
      const { start, end } = line(spec.stroke);
      return [{ key: spec.stroke, start: at(start), end: at(end) }];
    }),
    fades: [...fades.values()].map((f) => ({ ...f, at: at(f.at) })),
  };
}

export const DRAW_PLANS: Record<StepId, DrawPlan> = {
  edge: planFor("edge"),
  network: planFor("network"),
  functions: planFor("functions"),
  centre: planFor("centre"),
  queue: planFor("queue"),
  admin: planFor("admin"),
};

/** How much of a line is drawn at a step's progress, 0 to 1. */
export function drawnAt(stroke: StrokeTiming, progress: number): number {
  if (stroke.end <= stroke.start) return progress >= stroke.end ? 1 : 0;
  return Math.max(
    0,
    Math.min(1, (progress - stroke.start) / (stroke.end - stroke.start)),
  );
}

/** How far in a fade is at a step's progress, 0 to 1. */
export function shownAt(fade: FadeTiming, progress: number): number {
  return Math.max(0, Math.min(1, (progress - fade.at) / FADE_SPAN));
}

/** Smoothed progress: calm at either end, the same both ways. */
export function ease(progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  return p * p * (3 - 2 * p);
}
