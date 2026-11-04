import { animate, type AnimationPlaybackControls } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DELAY,
  layoutAt,
  must,
  PLAN,
  pieceApart,
  project,
  SUBS,
  type Vec3,
} from "./explode";
import { iso } from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { EASE } from "@/ui/tokens/motion";

/** Seconds for the whole explode (staggered) and the reassembly. */
const APART_S = 1.5;
const TOGETHER_S = 1.0;
const FOCUS_S = 0.7;

export interface ExplodeOptions {
  apart: boolean;
  focus: PartId | null;
  /** Phone-lite: only the part in focus comes apart. */
  lite: boolean;
  platform: PlatformIndex;
  reducedMotion: boolean;
}

type Focus = Record<PartId, number>;
const focusFor = (part: PartId | null): Focus =>
  Object.fromEntries(PART_ORDER.map((p) => [p, p === part ? 1 : 0])) as Focus;

const sameOrder = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const add3 = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const translate = (offset: Vec3) => {
  const [x, y] = project(offset);
  return `translate(${x.toFixed(2)},${y.toFixed(2)})`;
};

/**
 * PROTOTYPE: drives the exploded figure. Two kinds of animated amount (taken
 * apart, and each part's focus) tween with Framer Motion's `animate`, which
 * retargets from wherever they are if the state changes mid-flight. Each
 * frame turns them into a layout (pure, in `explode.ts`), writes transforms
 * straight to the registered SVG nodes, and re-sorts paint order, setting
 * React state only when the order actually changes.
 */
export function useExplode({
  apart,
  focus,
  lite,
  platform,
  reducedMotion,
}: ExplodeOptions) {
  const amounts = useRef({ apart: apart ? 1 : 0, focus: focusFor(focus) });
  const nodes = useRef(new Map<string, SVGElement>());
  const [order, setOrder] = useState(
    () => layoutAt({ ...amounts.current, lite }, platform).order,
  );
  const settings = useRef({ lite, platform });
  settings.current = { lite, platform };
  const waiters = useRef<(() => void)[]>([]);
  const frame = useRef(0);

  const draw = useCallback(() => {
    frame.current = 0;
    const { lite: isLite, platform: live } = settings.current;
    const now = { ...amounts.current, lite: isLite };
    const layout = layoutAt(now, live);
    const get = (key: string) => nodes.current.get(key);

    for (const sub of SUBS) {
      const offset = must(layout.offset, sub.id);
      const each =
        pieceApart(now.apart, must(DELAY, sub.id)) *
        (isLite ? now.focus[sub.part] : 1);
      get(`piece:${sub.id}`)?.setAttribute("transform", translate(offset));

      const [from, to] = must(layout.axis, sub.id);
      const line = get(`axis:${sub.id}`);
      if (line) {
        const [x1, y1] = iso(...from);
        const [x2, y2] = iso(...to);
        line.setAttribute("x1", x1.toFixed(2));
        line.setAttribute("y1", y1.toFixed(2));
        line.setAttribute("x2", x2.toFixed(2));
        line.setAttribute("y2", y2.toFixed(2));
        line.style.opacity = Math.hypot(x2 - x1, y2 - y1) > 2 ? "1" : "0";
      }

      const foot = get(`foot:${sub.id}`);
      if (foot) foot.style.opacity = String(each);

      const tag = get(`tag:${sub.id}`);
      if (tag) {
        tag.setAttribute("transform", translate(offset));
        // Numbers show for the part in focus only: all of them at once
        // read as noise.
        tag.style.opacity = String(each * now.focus[sub.part] ** 2);
      }
    }

    const plateTag = get("tag:9.4");
    if (plateTag) {
      plateTag.style.opacity = String(now.apart * now.focus.cloud ** 2);
    }

    for (const part of PART_ORDER) {
      const on = PLAN[part].badgeOn;
      const badge = get(`badge:${part}`);
      if (badge && on) {
        const extra =
          (PLAN[part].badgeLift ?? 0) *
          pieceApart(now.apart, must(DELAY, on)) *
          (isLite ? 0 : 1);
        badge.setAttribute(
          "transform",
          translate(add3(must(layout.offset, on), [0, 0, extra])),
        );
      }
    }

    // Pipes draw off in the first third of coming apart, and back on in the
    // last third of going together (they join nothing while apart).
    const pipes = get("pipes");
    if (pipes) {
      const off = isLite ? 0 : Math.min(1, now.apart * 3);
      pipes.style.strokeDasharray = off > 0 ? "1 1" : "";
      pipes.style.strokeDashoffset = off > 0 ? String(off) : "";
      pipes.style.opacity = off >= 1 ? "0" : "1";
    }

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

  useLayoutEffect(() => {
    draw();
    return () => cancelAnimationFrame(frame.current);
  }, [draw]);

  // The platform or phone-lite changing re-lays without animating.
  useEffect(schedule, [lite, platform, schedule]);

  const apartAnim = useRef<AnimationPlaybackControls | null>(null);
  useEffect(() => {
    const target = apart ? 1 : 0;
    apartAnim.current?.stop();
    const from = amounts.current.apart;
    if (from === target) return;
    if (reducedMotion) {
      amounts.current.apart = target;
      schedule();
      return;
    }
    const span = apart ? APART_S : TOGETHER_S;
    apartAnim.current = animate(from, target, {
      duration: span * Math.abs(target - from),
      ease: "linear",
      onUpdate: (value) => {
        amounts.current.apart = value;
        schedule();
      },
    });
  }, [apart, reducedMotion, schedule]);

  const focusAnims = useRef(new Map<PartId, AnimationPlaybackControls>());
  useEffect(() => {
    for (const part of PART_ORDER) {
      const target = part === focus ? 1 : 0;
      focusAnims.current.get(part)?.stop();
      const from = amounts.current.focus[part];
      if (from === target) continue;
      if (reducedMotion) {
        amounts.current.focus[part] = target;
        continue;
      }
      focusAnims.current.set(
        part,
        animate(from, target, {
          duration: FOCUS_S,
          ease: [...EASE.lift],
          onUpdate: (value) => {
            amounts.current.focus[part] = value;
            schedule();
          },
        }),
      );
    }
    schedule();
  }, [focus, reducedMotion, schedule]);

  useEffect(() => {
    const anims = focusAnims.current;
    return () => {
      apartAnim.current?.stop();
      anims.forEach((anim) => anim.stop());
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
