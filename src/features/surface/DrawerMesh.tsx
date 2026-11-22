import { useEffect, useRef } from "react";
import { canvasPixelRatio } from "./canvasWindow";
import { DRAWER_QUIET, drawerLookFor, drawerReach } from "./drawerLook";
import { type Box } from "./mesh";
import { meshColours } from "./meshColours";
import { meshFacets } from "./meshFacets";
import { paintMesh } from "./paintMesh";
import { DRAWER_LEVELS, type DrawerLevel, lineKeepUnderText } from "./strength";
import { drawTextMask, textLineBoxes } from "./textMask";

export interface DrawerMeshProps {
  /** How strongly it's drawn at the foot (see DRAWER_LEVELS). */
  strength: DrawerLevel;
}

/** The masks are drawn at half the drawer's scale: they're all soft edges. */
const MASK_SCALE = 0.5;

/**
 * The drawer's sheet with the pencil mesh: paper instead of white, and the
 * mesh, still (people are typing), strongest in the empty paper under the
 * form and gone by the time it reaches it. The pencil fades out round every
 * field, button, error and alert, and thins behind each line of text as on
 * the page, so labels and messages keep AA. It sits behind the form inside
 * the drawer (z-index -1 in the dialog's own stacking context) and redraws
 * only when the drawer's content changes size: it opens, an error appears,
 * the window resizes.
 */
export function DrawerMesh({ strength }: DrawerMeshProps) {
  const level = DRAWER_LEVELS[strength];
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const sheet = layer?.parentElement;
    if (!layer || !canvas || !context || !sheet) return undefined;
    const textMask = document.createElement("canvas");
    const fieldMask = document.createElement("canvas");
    let frame = 0;

    const draw = () => {
      frame = 0;
      const width = sheet.clientWidth;
      const height = sheet.scrollHeight;
      if (width === 0 || height === 0) return;
      layer.style.height = `${height}px`;
      const ratio = canvasPixelRatio(window.devicePixelRatio, width, height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const origin = layer.getBoundingClientRect();
      const local = (r: DOMRect): Box => ({
        left: r.left - origin.left,
        top: r.top - origin.top,
        right: r.right - origin.left,
        bottom: r.bottom - origin.top,
      });
      const content = [...sheet.children].filter((child) => child !== layer);
      const quiet = content
        .flatMap((child) => [...child.querySelectorAll(DRAWER_QUIET)])
        .map((element) => element.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map(local);
      const text = textLineBoxes(
        content,
        { x: origin.left, y: origin.top },
        () => true,
      );
      const contentBottom = Math.max(
        0,
        ...quiet.map((box) => box.bottom),
        ...text.map((box) => box.bottom),
      );

      const look = drawerLookFor(width, level);
      const rect = { left: 0, top: 0, right: width, bottom: height };
      const band = { left: 0, top: 0, width, height };
      drawTextMask(textMask, text, band, MASK_SCALE);
      drawTextMask(fieldMask, quiet, band, MASK_SCALE);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      paintMesh(context, meshFacets(rect, look, quiet, null), {
        ...meshColours(sheet),
        edge: look.edge,
        top: 0,
        bottom: height,
        reach: drawerReach(height, contentBottom),
        protect: [
          { mask: textMask, ...band, keep: lineKeepUnderText(level) },
          { mask: fieldMask, ...band, keep: 0 },
        ],
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    observer?.observe(sheet);
    for (const child of sheet.children) {
      if (child !== layer) observer?.observe(child);
    }
    document.fonts.addEventListener("loadingdone", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [level]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-testid="drawer-mesh"
      className="pointer-events-none absolute inset-x-0 top-0 z-[-1] min-h-full overflow-hidden bg-surface"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
