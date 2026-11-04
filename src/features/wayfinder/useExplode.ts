import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  badgeOffset,
  type CartridgeLifts,
  DELAY,
  type ExplodeAmounts,
  layoutAt,
  liftsFor,
  must,
  pieceApart,
  pipeRetract,
  project,
  SUBS,
  type Vec3,
} from "./explode";
import { iso, ROUTE_KEYS, type Point } from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { type TagLayout, tierShift } from "./tags";
import { cubicBezier, linear, tween } from "@/lib/tween";
import { DURATION, EASE } from "@/ui/tokens/motion";

const LIFT = cubicBezier(...EASE.lift);
/** The figure's growth follows the whole run, easing in and out. */
const easeInOut = (t: number) => t * t * (3 - 2 * t);

export interface ExplodeOptions {
  /** Taken apart (the target; the hook animates to it). */
  apart: boolean;
  /** The part in focus, if any. */
  focus: PartId | null;
  /** Phones: only the part in focus comes apart, in place. */
  lite: boolean;
  /** The live AI platform (the other cartridges stand lifted). */
  platform: PlatformIndex;
  /** How much the figure grows while taken apart (1: not at all). */
  zoom: number;
  /** Go back together quickly (the demo is waiting). */
  quick: boolean;
  reducedMotion: boolean;
  /** Where each number tag settles (see `tags.ts`). */
  placed: TagLayout;
}

type Focus = Record<PartId, number>;
const focusFor = (part: PartId | null): Focus =>
  Object.fromEntries(PART_ORDER.map((p) => [p, p === part ? 1 : 0])) as Focus;

const sameOrder = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const fixed = (n: number) => n.toFixed(2);
const translate = (offset: Vec3) => {
  const [x, y] = project(offset);
  return `translate(${fixed(x)},${fixed(y)})`;
};
const plus = ([x, y]: Point, [dx, dy]: Point): Point => [x + dx, y + dy];

interface Amounts {
  apart: number;
  focus: Focus;
  lifts: [number, number, number];
}

/**
 * Drives the exploded figure. Three kinds of animated amount (taken apart,
 * each part's focus, and each AI cartridge's lift) tween over
 * requestAnimationFrame, retargeting from wherever they are if the state
 * changes mid-flight. Each frame turns them into a layout (pure, in
 * `explode.ts`), writes transforms and positions straight to the registered
 * SVG nodes (skipping any that wouldn't change), and re-sorts the paint
 * order, setting React state only when the order actually changes.
 */
export function useExplode({
  apart,
  focus,
  lite,
  platform,
  zoom,
  quick,
  reducedMotion,
  placed,
}: ExplodeOptions) {
  const amounts = useRef<Amounts>({
    apart: apart ? 1 : 0,
    focus: focusFor(focus),
    lifts: [...liftsFor(platform)],
  });
  const nodes = useRef(new Map<string, SVGElement>());
  const written = useRef(new Map<string, string>());
  const [order, setOrder] = useState(
    () => layoutAt({ ...amounts.current, lite }, amounts.current.lifts).order,
  );
  const settings = useRef({ lite, zoom, placed });
  settings.current = { lite, zoom, placed };
  const waiters = useRef<(() => void)[]>([]);
  const frame = useRef(0);

  const draw = useCallback(() => {
    frame.current = 0;
    const { lite: isLite, zoom: grow, placed: tags } = settings.current;
    const { lifts } = amounts.current;
    const now: ExplodeAmounts = { ...amounts.current, lite: isLite };
    const layout = layoutAt(now, lifts as CartridgeLifts);
    const cache = written.current;

    /** Sets an attribute (or, with `style`, a style) unless it already has that value. */
    const set = (key: string, name: string, value: string, style = false) => {
      const node = nodes.current.get(key);
      if (!node) return;
      const id = `${key}|${name}`;
      if (cache.get(id) === value) return;
      cache.set(id, value);
      if (style) node.style.setProperty(name, value);
      else node.setAttribute(name, value);
    };

    for (const sub of SUBS) {
      const offset = must(layout.offset, sub.id);
      const each =
        pieceApart(now.apart, must(DELAY, sub.id)) *
        (isLite ? now.focus[sub.part] : 1);
      set(`piece:${sub.id}`, "transform", translate(offset));

      const [from, to] = must(layout.axis, sub.id);
      const [x1, y1] = iso(...from);
      const [x2, y2] = iso(...to);
      set(`axis:${sub.id}`, "x1", fixed(x1));
      set(`axis:${sub.id}`, "y1", fixed(y1));
      set(`axis:${sub.id}`, "x2", fixed(x2));
      set(`axis:${sub.id}`, "y2", fixed(y2));
      set(
        `axis:${sub.id}`,
        "opacity",
        Math.hypot(x2 - x1, y2 - y1) > 2 ? "1" : "0",
        true,
      );
      set(`foot:${sub.id}`, "opacity", fixed(each), true);
    }

    // Number tags: shown for the part in focus only (all of them at once
    // read as noise). The dot rides its piece, the number its part's tier.
    // The part's badge steps aside for them: they carry its number now.
    const tagsShown = new Map<PartId, number>();
    for (const tag of tags.tags.values()) {
      const key = tag.id;
      const each = tag.sub
        ? pieceApart(now.apart, must(DELAY, tag.sub)) *
          (isLite ? now.focus[tag.part] : 1)
        : now.apart;
      const shown = each * now.focus[tag.part] ** 2;
      tagsShown.set(tag.part, Math.max(tagsShown.get(tag.part) ?? 0, shown));
      set(`tag:${key}`, "opacity", fixed(shown), true);
      if (shown === 0) continue;
      const dot = tag.sub
        ? plus(tag.at, project(must(layout.offset, tag.sub)))
        : tag.at;
      const shift = tierShift(tag.part, now);
      const [ex, ey] = plus(tag.end, shift);
      const [tx, ty] = plus(tag.text, shift);
      set(`dot:${key}`, "cx", fixed(dot[0]));
      set(`dot:${key}`, "cy", fixed(dot[1]));
      set(`lead:${key}`, "x1", fixed(dot[0]));
      set(`lead:${key}`, "y1", fixed(dot[1]));
      set(`lead:${key}`, "x2", fixed(ex));
      set(`lead:${key}`, "y2", fixed(ey));
      set(`num:${key}`, "x", fixed(tx));
      set(`num:${key}`, "y", fixed(ty));
    }

    for (const part of PART_ORDER) {
      set(
        `badge:${part}`,
        "transform",
        translate(badgeOffset(part, layout, now)),
      );
      // Another part's tags may cover it too: it steps aside for them.
      const covered = PART_ORDER.reduce(
        (most, other) =>
          tags.covers[other].includes(part)
            ? Math.max(most, tagsShown.get(other) ?? 0)
            : most,
        tagsShown.get(part) ?? 0,
      );
      set(`badge-face:${part}`, "opacity", fixed(1 - covered), true);
    }

    // Pipes draw off as the parts they join lift (on phones, only the open
    // part's), and back on as they seat; lit lines and the travelling
    // message only belong on the whole board.
    const retract = pipeRetract(now);
    let anyOff = 0;
    for (const key of ROUTE_KEYS) {
      const off = retract[key];
      anyOff = Math.max(anyOff, off);
      set(`route:${key}`, "stroke-dasharray", off > 0 ? "1 1" : "none", true);
      set(`route:${key}`, "stroke-dashoffset", fixed(off), true);
      set(`route:${key}`, "opacity", off >= 1 ? "0" : "1", true);
    }
    set("lit", "opacity", fixed(1 - anyOff), true);
    set("pulse", "opacity", anyOff > 0 ? "0" : "1", true);

    // Grows on wide screens while taken apart, from its bottom-right corner.
    const scale = isLite ? 1 : 1 + (grow - 1) * easeInOut(now.apart);
    set(
      "zoom",
      "transform",
      scale === 1 ? "none" : `scale(${scale.toFixed(4)})`,
      true,
    );

    setOrder((previous) =>
      sameOrder(previous, layout.order) ? previous : layout.order,
    );

    if (now.apart === 0 && waiters.current.length) {
      const ready = waiters.current;
      waiters.current = [];
      ready.forEach((resolve) => resolve());
    }
  }, []);

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(draw);
  }, [draw]);

  // Drawn before the first paint, and again (without animating) when
  // phone-lite, the zoom or the tags' places change.
  useLayoutEffect(() => {
    written.current.clear();
    draw();
  }, [lite, zoom, placed, draw]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const stopApart = useRef<() => void>(() => {});
  useEffect(() => {
    const target = apart ? 1 : 0;
    stopApart.current();
    const from = amounts.current.apart;
    if (from === target) return;
    const span = apart
      ? DURATION.apart
      : quick
        ? DURATION.state
        : DURATION.together;
    stopApart.current = tween({
      from,
      to: target,
      duration: reducedMotion ? 0 : span * 1000 * Math.abs(target - from),
      ease: linear,
      onUpdate: (value) => {
        amounts.current.apart = value;
        schedule();
      },
    });
  }, [apart, quick, reducedMotion, schedule]);

  const stopFocus = useRef(new Map<PartId, () => void>());
  useEffect(() => {
    for (const part of PART_ORDER) {
      const target = part === focus ? 1 : 0;
      stopFocus.current.get(part)?.();
      const from = amounts.current.focus[part];
      if (from === target) continue;
      stopFocus.current.set(
        part,
        tween({
          from,
          to: target,
          duration: reducedMotion ? 0 : DURATION.flash * 1000,
          ease: LIFT,
          onUpdate: (value) => {
            amounts.current.focus[part] = value;
            schedule();
          },
        }),
      );
    }
  }, [focus, reducedMotion, schedule]);

  const stopLifts = useRef<(() => void)[]>([]);
  useEffect(() => {
    const targets = liftsFor(platform);
    stopLifts.current.forEach((stop) => stop());
    stopLifts.current = targets.map((target, index) =>
      tween({
        from: amounts.current.lifts[index],
        to: target,
        duration:
          reducedMotion || amounts.current.lifts[index] === target
            ? 0
            : DURATION.slow * 1000,
        ease: LIFT,
        onUpdate: (value) => {
          amounts.current.lifts[index] = value;
          schedule();
        },
      }),
    );
  }, [platform, reducedMotion, schedule]);

  useEffect(() => {
    const focusStops = stopFocus.current;
    return () => {
      stopApart.current();
      focusStops.forEach((stop) => stop());
      stopLifts.current.forEach((stop) => stop());
    };
  }, []);

  const register = useCallback(
    (key: string) => (node: SVGElement | null) => {
      if (node) nodes.current.set(key, node);
      else nodes.current.delete(key);
    },
    [],
  );

  /** Resolves once the figure is fully assembled (now, if it already is). */
  const whenAssembled = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (amounts.current.apart === 0) resolve();
        else waiters.current.push(resolve);
      }),
    [],
  );

  return { order, register, whenAssembled };
}
