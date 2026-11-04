/**
 * Direction B's maths: the app's session shape (its `src/domain/shape.ts`
 * and the spec's Session maths), for an even session at the shipped 0.8s
 * tempo. The reps are spread evenly through the window; each gets the same
 * slot (the interval): the rep's movement, then rest, then a count-in of
 * whole seconds (up to five) into the next. The set on your hips is held a
 * second while the slot has room for it, and takes a tempo beat when it
 * hasn't (a dense session, the app's ADR 0024).
 */
export type BurpeeId = "six-count" | "navy-seal";

export const BURPEES: Record<BurpeeId, { label: string; positions: number }> = {
  "six-count": { label: "Six-count", positions: 8 },
  "navy-seal": { label: "Navy SEAL", positions: 12 },
};

export const TEMPO_MS = 800;
export const SET_BEAT_MS = 1000;
const TICK_MS = 1000;
const MAX_TICKS = 5;
export const REPS_STEP = 5;
export const MINUTES_STEP = 5;
export const MIN_REPS = 5;
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 60;

export interface PacingShape {
  reps: number;
  positions: number;
  /** From one rep's start to the next's. */
  intervalMs: number;
  /** The set's beat this session runs on: a second, or a tempo beat when dense. */
  setBeatMs: number;
  /** The movement: the set beat, then a tempo beat per position after it. */
  repMs: number;
  restMs: number;
  /** Whole seconds counted into the next rep, after the rest. */
  countInMs: number;
  /** The session ends on the last rep's last beat. */
  totalMs: number;
}

/** The session's shape, or null if the reps don't fit the window at this tempo. */
export function pacingShape(
  burpee: BurpeeId,
  reps: number,
  minutes: number,
): PacingShape | null {
  const { positions } = BURPEES[burpee];
  const intervalMs = (minutes * 60_000) / reps;
  const full = SET_BEAT_MS + (positions - 1) * TEMPO_MS;
  if (intervalMs < positions * TEMPO_MS) return null;
  const setBeatMs = intervalMs >= full ? SET_BEAT_MS : TEMPO_MS;
  const repMs = setBeatMs + (positions - 1) * TEMPO_MS;
  // Whole milliseconds first: the interval is a division and lands on floats.
  const spare = Math.round(intervalMs - repMs);
  const countInMs = Math.min(Math.floor(spare / TICK_MS), MAX_TICKS) * TICK_MS;
  return {
    reps,
    positions,
    intervalMs,
    setBeatMs,
    repMs,
    restMs: spare - countInMs,
    countInMs,
    totalMs: (reps - 1) * intervalMs + repMs,
  };
}

/** The most reps of this burpee the window holds at this tempo. */
export function mostReps(burpee: BurpeeId, minutes: number): number {
  const most = Math.floor(
    (minutes * 60_000) / (BURPEES[burpee].positions * TEMPO_MS),
  );
  return most - (most % REPS_STEP);
}

/** The rep the zoom goes into: the one halfway is called after. */
export function focusRep(reps: number): number {
  return Math.max(0, Math.floor(reps / 2) - 1);
}

export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

/** A clock reading, minutes and seconds to a tenth: 19:54.6. */
export function clock(ms: number): string {
  const tenths = Math.round(ms / 100);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}

/** What the session will feel like, in a sentence (the app's readout, written out). */
export function readout(shape: PacingShape): string {
  const every = `One every ${seconds(shape.intervalMs)}`;
  if (shape.countInMs === 0 && shape.restMs < 500) {
    return `${every}: ${seconds(shape.repMs)} of work and next to no rest. No room for a count-in at this pace.`;
  }
  const count = shape.countInMs / 1000;
  const countIn =
    count > 0
      ? ` and a ${["", "one", "two", "three", "four", "five"][count]}-second count-in`
      : "";
  return `${every}: ${seconds(shape.repMs)} of work, ${seconds(shape.restMs)} of rest${countIn}.`;
}

export interface View {
  start: number;
  span: number;
}

export type ZoomLevel = 0 | 1 | 2;

/** The three views: the session, the focus rep's slot, the rep itself. */
export function views(shape: PacingShape): [View, View, View] {
  const start = focusRep(shape.reps) * shape.intervalMs;
  return [
    { start: 0, span: shape.totalMs },
    { start, span: shape.intervalMs },
    { start, span: shape.repMs },
  ];
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** Where the zoom sits for a 0 to 1 scroll progress: held at each level, travelling between. */
export function zoomLevel(progress: number): number {
  const p = clamp01(progress);
  if (p < 0.18) return 0;
  if (p < 0.4) return smooth((p - 0.18) / 0.22);
  if (p < 0.58) return 1;
  if (p < 0.8) return 1 + smooth((p - 0.58) / 0.22);
  return 2;
}

/**
 * The view at a continuous zoom level (0 to 2). The span moves on a log
 * scale, so every doubling takes the same scroll (the powers-of-ten feel),
 * and the start follows the same affine path, so the focus stays in frame.
 */
export function viewAt(level: number, all: [View, View, View]): View {
  const from = Math.min(1, Math.floor(level));
  const a = all[from];
  const b = all[from + 1];
  const t = clamp01(level - from);
  const span = Math.exp(
    Math.log(a.span) + (Math.log(b.span) - Math.log(a.span)) * t,
  );
  const f = a.span === b.span ? t : (a.span - span) / (a.span - b.span);
  return { start: a.start + (b.start - a.start) * f, span };
}

/** The shape with the reps cut to what fits (never null: the most that fits always does). */
export function fittedShape(
  burpee: BurpeeId,
  reps: number,
  minutes: number,
): PacingShape {
  const shape = pacingShape(
    burpee,
    Math.min(reps, mostReps(burpee, minutes)),
    minutes,
  );
  if (!shape) throw new Error(`No ${burpee} session fits ${minutes} minutes`);
  return shape;
}
