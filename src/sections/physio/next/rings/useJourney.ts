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

export interface JourneyResult {
  text: string;
  held: boolean;
}

/**
 * The journeys' state and their runner: the trace, which nodes are lit
 * (or holding), which routes are lit, the queue's token, the result, and
 * the pulse that carries a journey round the rings. One journey at a time;
 * nothing runs by itself. Under reduced motion the pulse doesn't travel:
 * the routes light hop by hop at once.
 */
export function useJourney(reducedMotion: boolean) {
  const [running, setRunning] = useState<JourneyId | null>(null);
  const [last, setLast] = useState<JourneyId | null>(null);
  const [trace, setTrace] = useState<TraceLine[]>([]);
  const [hot, setHot] = useState<ReadonlySet<NodeId>>(new Set());
  const [held, setHeld] = useState<ReadonlySet<NodeId>>(new Set());
  const [lit, setLit] = useState<ReadonlySet<RouteKey>>(new Set());
  const [token, setToken] = useState<TokenState | null>(null);
  const [result, setResult] = useState<JourneyResult | null>(null);
  const pulseRef = useRef<SVGGElement>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const timers = useRef(new Set<number>());
  const litSoFar = useRef(new Set<RouteKey>());

  useEffect(() => {
    alive.current = true;
    const pending = timers.current;
    return () => {
      alive.current = false;
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const run = useCallback(
    async (id: JourneyId) => {
      const later = (fn: () => void, ms: number) => {
        const timer = window.setTimeout(() => {
          timers.current.delete(timer);
          fn();
        }, ms);
        timers.current.add(timer);
      };

      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          if (reducedMotion) {
            resolve();
            return;
          }
          later(resolve, ms);
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

      const movePulse = (x: number, y: number) => {
        const pulse = pulseRef.current;
        pulse?.setAttribute("transform", `translate(${x},${y})`);
        pulse?.setAttribute("visibility", "visible");
      };
      const parkPulse = () => {
        const pulse = pulseRef.current;
        pulse?.setAttribute("transform", OFF_STAGE);
        pulse?.setAttribute("visibility", "hidden");
      };
      const litLine = (route: RouteKey) =>
        pulseRef.current?.ownerSVGElement?.querySelector<SVGPathElement>(
          `[data-lit-route="${route}"]`,
        ) ?? null;

      const travel = (route: RouteKey, reverse = false) =>
        new Promise<void>((resolve) => {
          const firstPass = !litSoFar.current.has(route);
          litSoFar.current.add(route);
          setLit(new Set(litSoFar.current));
          if (reducedMotion || !alive.current) {
            resolve();
            return;
          }
          const points = routePoints(route, reverse);
          const total = polylineLength(points);
          const duration = Math.max(MIN_LEG_MS, total * MS_PER_UNIT);
          // A route lights behind the pulse the first time it's travelled
          // outward (drawn with pathLength 1); on the way back it's already lit.
          const line = firstPass && !reverse ? litLine(route) : null;
          line?.style.setProperty("transition", "none");
          line?.style.setProperty("stroke-dasharray", "1 2");
          line?.style.setProperty("stroke-dashoffset", "1");
          const start = performance.now();
          const frame = (now: number) => {
            if (!alive.current) {
              resolve();
              return;
            }
            const progress = Math.min(1, (now - start) / duration);
            const [x, y] = pointAlong(points, progress * total);
            movePulse(x, y);
            line?.style.setProperty("stroke-dashoffset", String(1 - progress));
            if (progress < 1) {
              requestAnimationFrame(frame);
              return;
            }
            for (const property of [
              "transition",
              "stroke-dasharray",
              "stroke-dashoffset",
            ]) {
              line?.style.removeProperty(property);
            }
            resolve();
          };
          requestAnimationFrame(frame);
        });

      if (busy.current) return;
      busy.current = true;
      setRunning(id);
      setLast(id);
      setResult(null);
      setToken(null);
      setTrace([]);
      litSoFar.current = new Set();
      setLit(new Set());

      for (const step of journeyById(id).steps) {
        if (!alive.current) return;
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
            // Sequential by design: each hop waits for the last.
            // eslint-disable-next-line no-await-in-loop
            await travel(step.route, step.reverse);
            break;
          default:
            break;
        }
      }
      if (!alive.current) return;
      parkPulse();
      setRunning(null);
      busy.current = false;
    },
    [reducedMotion],
  );

  return { run, running, last, trace, hot, held, lit, token, result, pulseRef };
}

export type JourneyState = ReturnType<typeof useJourney>;
