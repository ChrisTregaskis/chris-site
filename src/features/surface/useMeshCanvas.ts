import { type RefObject, useEffect } from "react";
import { canvasPixelRatio, canvasWindow } from "./canvasWindow";
import { type Box } from "./mesh";
import { meshColours } from "./meshColours";
import { type Dent, meshFacets } from "./meshFacets";
import { meshLookFor } from "./meshLook";
import { paintMesh } from "./paintMesh";
import { type Reach, bandReach, endsReach } from "./reach";
import { type MeshReach } from "./settings";
import { approach } from "./shading";
import { lineKeepUnderText } from "./strength";
import { drawTextMask, textLineBoxes } from "./textMask";

/**
 * The drawings the mesh steps back from, found fresh each frame (the
 * physio drawing and the Burpees set load late): the Wayfinder figure, the
 * physio rings' room (its exact size, drawn or not) and the Burpees count.
 * At its ends the mesh never reaches them; over the whole page it does.
 */
export const QUIET_SELECTORS = [
  '#work [data-bar-flush] svg[role="img"]',
  '[data-testid="rings-room"]',
  '[data-testid="burpees-count"]',
] as const;

/** The sections that set where the mesh lies at its ends (see reach.ts). */
const HERO = "top";
const WORK = "work";
const ABOUT = "about";

/** The text the mesh steps back from: everything read on the page. */
const TEXT_ROOTS = "#main, footer";

/** The text mask is drawn at half the page's scale: it's all soft edges. */
const MASK_SCALE = 0.5;

/** How fast the dent follows the pointer, presses in and lets go (time constants, ms). */
const FOLLOW_MS = 90;
const PRESS_MS = 160;
const RELEASE_MS = 420;

export interface MeshCanvasOptions {
  /** Whether the facets press in under the mouse. */
  pointer: boolean;
  /** Whether the net's edges are drawn in pencil. */
  lines: boolean;
  /** Where on the page the mesh lies. */
  reach: MeshReach;
  /** How strongly it's drawn in open paper (see strength.ts; 1 is Subtle). */
  level: number;
  /** Whether it steps back behind text. */
  protect: boolean;
}

/**
 * Draws the paper's mesh into `canvas` (inside `layer`, which spans the
 * page behind everything). It draws only when something changed: a scroll
 * (the canvas's band moving on, or a pinned drawing moving against the
 * page), a resize, the page's height changing, or, with `pointer`, the
 * mouse moving; the dent's easing runs frames only until it settles. Where
 * the mesh doesn't reach (the case studies, at its ends), the canvas is
 * cleared once and nothing more is drawn or measured. Nothing draws while
 * the tab is hidden.
 */
export function useMeshCanvas(
  layerRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  {
    pointer: pointerMode,
    lines,
    reach: reachMode,
    level,
    protect,
  }: MeshCanvasOptions,
): void {
  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!layer || !canvas || !context) return undefined;
    const page = layer.parentElement ?? document.body;

    let look = meshLookFor(1, 0);
    let width = 0;
    let viewHeight = 0;
    let pageHeight = 0;
    let ratio = 1;
    let band = { top: 0, height: 0 };
    let reach: Reach | null = null;
    let colours = meshColours(document.documentElement);
    let drawn = "";
    let frame = 0;
    let last = 0;
    let hidden = document.hidden;
    let pointer: { x: number; y: number } | null = null;
    const dent: Dent = { x: 0, y: 0, amount: 0 };
    let dentPlaced = false;
    // The text the mesh steps back from, and its mask for the current band.
    let textBoxes: Box[] = [];
    let textVersion = 0;
    const mask = document.createElement("canvas");
    let maskKey = "";

    const pageBox = (id: string) => {
      const rect = document.getElementById(id)?.getBoundingClientRect();
      return rect
        ? {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
          }
        : null;
    };

    // Every line of text where the mesh lies, re-measured whenever the
    // layout or the fonts change (never per frame: none of it moves).
    const measureText = () => {
      if (!protect || lineKeepUnderText(level) >= 1) {
        textBoxes = [];
      } else {
        const pad = 64;
        textBoxes = textLineBoxes(
          [...document.querySelectorAll(TEXT_ROOTS)],
          { x: 0, y: -window.scrollY },
          (box) => bandReach(box.top - pad, box.bottom + pad, reach) > 0,
        );
      }
      textVersion += 1;
    };

    // Where the mesh lies: from the sections' real positions, measured on
    // every layout change (a lazy chapter landing moves About down).
    const measureReach = () => {
      if (reachMode === "page") {
        reach = null;
        return;
      }
      const hero = pageBox(HERO);
      const work = pageBox(WORK);
      const about = pageBox(ABOUT);
      reach =
        hero && work && about
          ? endsReach({
              heroTop: hero.top,
              heroBottom: hero.bottom,
              workTop: work.top,
              aboutTop: about.top,
              aboutBottom: about.bottom,
            })
          : null;
      measureText();
    };

    const measure = () => {
      width = layer.clientWidth;
      viewHeight = window.innerHeight;
      // Floored, so the layer never makes the page a pixel taller.
      pageHeight = Math.floor(page.getBoundingClientRect().height);
      layer.style.height = `${pageHeight}px`;
      look = meshLookFor(width, width / 2, lines, level);
      const height = canvasWindow(0, viewHeight, pageHeight).height;
      ratio = canvasPixelRatio(window.devicePixelRatio, width, height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      colours = meshColours(document.documentElement);
      measureReach();
      drawn = "";
    };

    const quietBoxes = (scrollY: number): Box[] => {
      const reachPx = look.falloff.margin + look.falloff.width;
      const boxes: Box[] = [];
      for (const selector of QUIET_SELECTORS) {
        for (const element of document.querySelectorAll(selector)) {
          watch(element);
          const r = element.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const box = {
            left: r.left,
            top: r.top + scrollY,
            right: r.right,
            bottom: r.bottom + scrollY,
          };
          if (
            box.bottom + reachPx < band.top ||
            box.top - reachPx > band.top + band.height
          ) {
            continue;
          }
          boxes.push(box);
        }
      }
      return boxes;
    };

    const clear = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const paint = (boxes: Box[]) => {
      const rect = {
        left: 0,
        top: band.top,
        right: width,
        bottom: band.top + band.height,
      };
      const keep = lineKeepUnderText(level);
      const guard = protect && keep < 1 && textBoxes.length > 0;
      const key = `${band.top}|${band.height}|${width}|${textVersion}`;
      if (guard && key !== maskKey) {
        drawTextMask(
          mask,
          textBoxes,
          { left: 0, top: band.top, width, height: band.height },
          MASK_SCALE,
        );
        maskKey = key;
      }
      clear();
      context.setTransform(ratio, 0, 0, ratio, 0, -band.top * ratio);
      paintMesh(
        context,
        meshFacets(rect, look, boxes, dent.amount > 0 ? dent : null),
        {
          ...colours,
          edge: look.edge,
          top: rect.top,
          bottom: rect.bottom,
          reach,
          protect: guard
            ? [
                {
                  mask,
                  left: 0,
                  top: band.top,
                  width,
                  height: band.height,
                  keep,
                },
              ]
            : [],
        },
      );
    };

    // Eases the dent towards the pointer (pressing in) or away (letting go);
    // true while it's still on its way.
    const easeDent = (scrollY: number, dt: number): boolean => {
      const target = pointer ? { x: pointer.x, y: pointer.y + scrollY } : null;
      if (target && !dentPlaced) {
        dent.x = target.x;
        dent.y = target.y;
        dentPlaced = true;
      } else if (target) {
        dent.x = approach(dent.x, target.x, dt, FOLLOW_MS);
        dent.y = approach(dent.y, target.y, dt, FOLLOW_MS);
      }
      const goal = target ? 1 : 0;
      dent.amount = approach(
        dent.amount,
        goal,
        dt,
        target ? PRESS_MS : RELEASE_MS,
      );
      if (!target && dent.amount < 0.004) {
        dent.amount = 0;
        dentPlaced = false;
      }
      return (
        Math.abs(dent.amount - goal) > 0.004 ||
        (target !== null &&
          Math.hypot(dent.x - target.x, dent.y - target.y) > 0.5)
      );
    };

    const run = (now: number) => {
      frame = 0;
      if (hidden) return;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const scrollY = window.scrollY;

      const next = canvasWindow(scrollY, viewHeight, pageHeight);
      if (next.top !== band.top || next.height !== band.height) {
        band = next;
        canvas.style.transform = `translate3d(0, ${band.top}px, 0)`;
      }

      // Nowhere in this band to draw: clear once, then nothing.
      if (bandReach(band.top, band.top + band.height, reach) === 0) {
        if (drawn !== "empty") {
          drawn = "empty";
          clear();
        }
        dent.amount = 0;
        dentPlaced = false;
        last = 0;
        return;
      }

      const moving = pointerMode && easeDent(scrollY, dt);

      const boxes = quietBoxes(scrollY);
      const key = [
        band.top,
        band.height,
        width,
        boxes
          .map((b) => [b.left, b.top, b.right, b.bottom].map(Math.round))
          .join(),
        dent.amount ? [dent.x, dent.y].map(Math.round).join() : "",
        dent.amount.toFixed(3),
      ].join("|");
      if (key !== drawn) {
        drawn = key;
        paint(boxes);
      }
      if (moving) schedule();
      else last = 0;
    };

    function schedule() {
      if (!frame && !hidden) frame = requestAnimationFrame(run);
    }

    const onResize = () => {
      measure();
      schedule();
    };
    const onVisibility = () => {
      hidden = document.hidden;
      if (hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        last = 0;
        drawn = "";
        schedule();
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer = null;
      schedule();
    };
    const onBlur = () => {
      pointer = null;
      schedule();
    };

    const pageObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            if (
              Math.floor(page.getBoundingClientRect().height) === pageHeight
            ) {
              measureReach();
            } else measure();
            drawn = "";
            schedule();
          });

    // A drawing can move or grow with no scroll at all: the Wayfinder figure
    // grows as it comes apart (a transform its own frames write), a lazy
    // drawing lands, the count's font arrives. Each one found is watched for
    // that, so the quiet round it follows.
    const watched = new WeakSet<Element>();
    const quietObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => schedule());
    const styleObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => schedule());
    function watch(element: Element) {
      if (watched.has(element)) return;
      watched.add(element);
      quietObserver?.observe(element);
      styleObserver?.observe(element, {
        attributes: true,
        attributeFilter: ["style", "transform"],
      });
    }

    // A font arriving reflows the text: measure it again.
    const onFonts = () => {
      measureText();
      drawn = "";
      schedule();
    };

    measure();
    schedule();
    pageObserver?.observe(page);
    document.fonts.addEventListener("loadingdone", onFonts);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (pointerMode) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut, { passive: true });
      window.addEventListener("blur", onBlur);
    }
    return () => {
      cancelAnimationFrame(frame);
      pageObserver?.disconnect();
      quietObserver?.disconnect();
      styleObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      document.fonts.removeEventListener("loadingdone", onFonts);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", onBlur);
      clear();
    };
  }, [layerRef, canvasRef, pointerMode, lines, reachMode, level, protect]);
}
