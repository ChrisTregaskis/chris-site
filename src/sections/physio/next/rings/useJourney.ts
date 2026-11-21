import { useCallback, useEffect, useRef, useState } from "react";
import { type NodeId, type RouteKey, routePoints } from "./geometry";
import {
  type JourneyId,
  journeyById,
  type TokenState,
  type TraceLine,
} from "./journeys";
import { pointAlong, polylineLength } from "@/lib/polyline";
import { DURATION } from "@/ui/tokens/motion";

/** How long a pulse takes per unit of route, with a floor per leg (as Wayfinder's). */
const MS_PER_UNIT = 6;
const MIN_LEG_MS = 320;
/** How long a wall that held stays red. */
const HOLD_MS = 1800;
/** Under reduced motion nothing travels, so a flashed node stays lit longer. */
const STILL_FLASH_MS = 4000;
const OFF_STAGE = "translate(-999,-999)";
/** The inline styles a route gets while it's drawn on behind the pulse. */
const DRAWING = ["transition", "stroke-dasharray", "stroke-dashoffset"];

export interface JourneyResult {
  text: string;
  held: boolean;
}

const NONE: ReadonlySet<never> = new Set();

/**
 * The journeys' state and their runner: the trace, which nodes are lit (or
 * holding), which routes are lit, the queue's token, the result, and the
 * pulse that carries a journey round the rings. One journey at a time;
 * nothing runs by itself.
 *
 * `cancel` stops a journey cleanly wherever it is: every timer and frame is
 * dropped, every pending wait released, the pulse parked, the route being
 * drawn has its inline styles taken off, and every lit route and node, the
 * token, the trace and the result are cleared. Starting another journey
 * cancels the one running, and so does unmounting. Under reduced motion the
 * pulse doesn't travel: the routes light hop by hop at once.
 */
export function useJourney(reducedMotion: boolean) {
  const [running, setRunning] = useState<JourneyId | null>(null);
  const [shown, setShown] = useState<JourneyId | null>(null);
  const [trace, setTrace] = useState<TraceLine[]>([]);
  const [hot, setHot] = useState<ReadonlySet<NodeId>>(NONE);
  const [held, setHeld] = useState<ReadonlySet<NodeId>>(NONE);
  const [lit, setLit] = useState<ReadonlySet<RouteKey>>(NONE);
  const [token, setToken] = useState<TokenState | null>(null);
  const [result, setResult] = useState<JourneyResult | null>(null);
  const pulseRef = useRef<SVGGElement>(null);

  /** Bumped by every cancel: a journey that finds it changed stops. */
  const generation = useRef(0);
  const timers = useRef(new Set<number>());
  const frames = useRef(new Set<number>());
  const pending = useRef(new Set<() => void>());
  const drawing = useRef(new Set<SVGPathElement>());
  const litSoFar = useRef(new Set<RouteKey>());

  const parkPulse = () => {
    const pulse = pulseRef.current;
    pulse?.setAttribute("transform", OFF_STAGE);
    pulse?.setAttribute("visibility", "hidden");
  };

  /** Drops everything in flight without touching React state (safe on unmount). */
  const halt = useCallback(() => {
    generation.current += 1;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    frames.current.forEach((frame) => cancelAnimationFrame(frame));
    frames.current.clear();
    for (const line of drawing.current) {
      for (const property of DRAWING) line.style.removeProperty(property);
    }
    drawing.current.clear();
    const release = [...pending.current];
    pending.current.clear();
    release.forEach((resolve) => resolve());
    litSoFar.current = new Set();
    parkPulse();
  }, []);

  const cancel = useCallback(() => {
    halt();
    setRunning(null);
    setShown(null);
    setTrace([]);
    setHot(NONE);
    setHeld(NONE);
    setLit(NONE);
    setToken(null);
    setResult(null);
  }, [halt]);

  useEffect(() => halt, [halt]);

  const run = useCallback(
    async (id: JourneyId) => {
      cancel();
      const mine = generation.current;
      const live = () => generation.current === mine;

      const later = (fn: () => void, ms: number) => {
        const timer = window.setTimeout(() => {
          timers.current.delete(timer);
          fn();
        }, ms);
        timers.current.add(timer);
      };

      /** A beat; released at once by a cancel. */
      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          if (reducedMotion) {
            resolve();
            return;
          }
          const done = () => {
            pending.current.delete(done);
            resolve();
          };
          pending.current.add(done);
          later(done, ms);
        });

      const lightFor = (
        set: (
          update: (previous: ReadonlySet<NodeId>) => ReadonlySet<NodeId>,
        ) => void,
        node: NodeId,
        ms: number,
      ) => {
        set((previous) => new Set(previous).add(node));
        later(
          () =>
            set((previous) => {
              const next = new Set(previous);
              next.delete(node);
              return next;
            }),
          reducedMotion ? STILL_FLASH_MS : ms,
        );
      };

      const travel = (route: RouteKey, reverse = false) =>
        new Promise<void>((resolve) => {
          const firstPass = !litSoFar.current.has(route);
          litSoFar.current.add(route);
          setLit(new Set(litSoFar.current));
          if (reducedMotion) {
            resolve();
            return;
          }
          const points = routePoints(route, reverse);
          const total = polylineLength(points);
          const duration = Math.max(MIN_LEG_MS, total * MS_PER_UNIT);
          // A route lights behind the pulse the first time it's travelled
          // outward (drawn with pathLength 1); on the way back it's lit.
          const line =
            firstPass && !reverse
              ? (pulseRef.current?.ownerSVGElement?.querySelector<SVGPathElement>(
                  `[data-lit-route="${route}"]`,
                ) ?? null)
              : null;
          if (line) {
            line.style.setProperty("transition", "none");
            line.style.setProperty("stroke-dasharray", "1 2");
            line.style.setProperty("stroke-dashoffset", "1");
            drawing.current.add(line);
          }
          const finish = () => {
            pending.current.delete(finish);
            if (line) {
              for (const property of DRAWING) {
                line.style.removeProperty(property);
              }
              drawing.current.delete(line);
            }
            resolve();
          };
          pending.current.add(finish);
          const start = performance.now();
          let handle = 0;
          const frame = (now: number) => {
            frames.current.delete(handle);
            if (!live()) return;
            const progress = Math.min(1, (now - start) / duration);
            const [x, y] = pointAlong(points, progress * total);
            const pulse = pulseRef.current;
            pulse?.setAttribute("transform", `translate(${x},${y})`);
            pulse?.setAttribute("visibility", "visible");
            line?.style.setProperty("stroke-dashoffset", String(1 - progress));
            if (progress < 1) {
              handle = requestAnimationFrame(frame);
              frames.current.add(handle);
              return;
            }
            finish();
          };
          handle = requestAnimationFrame(frame);
          frames.current.add(handle);
        });

      setRunning(id);
      setShown(id);
      for (const step of journeyById(id).steps) {
        if (!live()) return;
        switch (step.type) {
          case "log":
            setTrace((previous) => [...previous, step.line]);
            break;
          case "flash":
            lightFor(setHot, step.node, DURATION.flash * 1000);
            break;
          case "block":
            lightFor(setHeld, step.node, HOLD_MS);
            break;
          case "token":
            setToken(step.state);
            // Sequential by design: each beat waits for the last.
            // eslint-disable-next-line no-await-in-loop
            await wait(DURATION.state * 1000);
            break;
          case "pause":
            // eslint-disable-next-line no-await-in-loop
            await wait(step.ms);
            break;
          case "result":
            setResult({ text: step.text, held: step.held });
            break;
          case "travel":
            // eslint-disable-next-line no-await-in-loop
            await travel(step.route, step.reverse);
            break;
          default:
            break;
        }
      }
      if (!live()) return;
      parkPulse();
      setRunning(null);
    },
    [cancel, reducedMotion],
  );

  return {
    run,
    cancel,
    running,
    shown,
    trace,
    hot,
    held,
    lit,
    token,
    result,
    pulseRef,
  };
}

export type JourneyState = ReturnType<typeof useJourney>;
