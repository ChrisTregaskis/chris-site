import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Ask,
  demoPlan,
  FREE_TEXT,
  type LogLine,
  type ReplyKind,
  swapLine,
} from "./demo";
import { type RouteKey, routePoints } from "./iso";
import { type PartId, type PlatformIndex } from "./parts";
import { pointAlong, polylineLength } from "@/lib/polyline";
import { DURATION } from "@/ui/tokens/motion";

export type ChatMessage =
  | { id: number; from: "me"; text: string }
  | { id: number; from: "bot"; kind: "greeting" }
  | { id: number; from: "bot"; kind: ReplyKind };

/** How long a pulse takes per unit of pipe, with a floor per leg (b3). */
const MS_PER_UNIT = 3.4;
const MIN_LEG_MS = 240;
/** Under reduced motion nothing travels, so a flashed part stays lit longer. */
const STILL_FLASH_MS = 4000;
/**
 * Where the pulse waits between messages. The figure's SVG draws outside its
 * box, so "far away" can still be on screen on a wide window: it is also
 * hidden while it waits.
 */
const OFF_STAGE = "translate(-999,-999)";

/**
 * The live demo's state and its runner: the chat, the trace, which parts are
 * flashing, which pipes are lit, the live AI platform, and the pulse that
 * carries a message round the figure. Under reduced motion the pulse doesn't
 * travel; the pipes light hop by hop instead.
 */
export function useWayfinderDemo(reducedMotion: boolean) {
  const [platform, setPlatform] = useState<PlatformIndex>(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, from: "bot", kind: "greeting" },
  ]);
  const [typing, setTyping] = useState(false);
  const [trace, setTrace] = useState<LogLine[]>([]);
  const [hot, setHot] = useState<ReadonlySet<PartId>>(new Set());
  const [lit, setLit] = useState<ReadonlySet<RouteKey>>(new Set());
  const pulseRef = useRef<SVGGElement>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const nextId = useRef(1);
  const platformRef = useRef(platform);
  const flashTimers = useRef(new Set<number>());

  useEffect(() => {
    platformRef.current = platform;
  }, [platform]);

  useEffect(() => {
    alive.current = true;
    const timers = flashTimers.current;
    return () => {
      alive.current = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

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

  /** Pipes lit so far for this message, as `lit` is, but readable mid-render. */
  const litSoFar = useRef(new Set<RouteKey>());
  /** A pipe's lit line in the figure (the pulse's SVG), for drawing it on. */
  const litLine = (route: RouteKey) =>
    pulseRef.current?.ownerSVGElement?.querySelector<SVGPathElement>(
      `[data-route="${route}"]`,
    ) ?? null;

  const flash = useCallback(
    (part: PartId) => {
      setHot((previous) => new Set(previous).add(part));
      const timer = window.setTimeout(
        () => {
          flashTimers.current.delete(timer);
          setHot((previous) => {
            const next = new Set(previous);
            next.delete(part);
            return next;
          });
        },
        reducedMotion ? STILL_FLASH_MS : DURATION.flash * 1000,
      );
      flashTimers.current.add(timer);
    },
    [reducedMotion],
  );

  const travel = useCallback(
    (route: RouteKey, reverse = false) =>
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
        // A pipe lights up behind the pulse the first time it is travelled
        // (lines are drawn with pathLength 1); on the way back it is lit.
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
      }),
    [reducedMotion],
  );

  /**
   * Send a message. A suggestion pill passes its own `ask` (and route);
   * anything typed is free text, which goes to the supervisor and back. The
   * message shows at once; given `ready` (the figure still going back
   * together), it sets off round the figure once that resolves.
   */
  const send = useCallback(
    async (question: string, ask: Ask = FREE_TEXT, ready?: Promise<void>) => {
      const text = question.trim();
      if (busy.current || !text) return;
      busy.current = true;
      setMessages((previous) => [
        ...previous,
        { id: nextId.current++, from: "me", text },
      ]);
      setTyping(true);
      litSoFar.current = new Set();
      setLit(new Set());
      if (ready) await ready;

      for (const step of demoPlan(ask, platformRef.current)) {
        if (!alive.current) return;
        if (step.type === "log") {
          const { line } = step;
          setTrace((previous) =>
            line.who === "widget" ? [line] : [...previous, line],
          );
        } else if (step.type === "flash") {
          flash(step.part);
        } else {
          // Sequential by design: each hop waits for the last.
          // eslint-disable-next-line no-await-in-loop
          await travel(step.route, step.reverse);
        }
      }
      if (!alive.current) return;
      parkPulse();
      setTyping(false);
      setMessages((previous) => [
        ...previous,
        { id: nextId.current++, from: "bot", kind: ask.key },
      ]);
      busy.current = false;
    },
    [flash, travel],
  );

  const swapPlatform = useCallback((next: PlatformIndex) => {
    setPlatform(next);
    setTrace([swapLine(next)]);
  }, []);

  return {
    platform,
    swapPlatform,
    messages,
    typing,
    trace,
    hot,
    lit,
    pulseRef,
    send,
  };
}
