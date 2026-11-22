import { useEffect, useRef } from "react";
import { canvasPixelRatio } from "./canvasWindow";
import { DRAWER_QUIET, drawerLookFor, drawerReach } from "./drawerLook";
import { type Box } from "./mesh";
import { meshColours } from "./meshColours";
import { meshFacets } from "./meshFacets";
import { paintMesh } from "./paintMesh";

/**
 * The drawer's sheet with the pencil mesh: paper instead of white, and the
 * mesh, still (people are typing), very faint, gathered at the foot of the
 * drawer and quiet round every field, button and error. It sits behind the
 * form inside the drawer (z-index -1 in the dialog's own stacking context)
 * and redraws only when the drawer's content changes size: it opens, an
 * error appears, the window resizes.
 */
export function DrawerMesh() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const sheet = layer?.parentElement;
    if (!layer || !canvas || !context || !sheet) return undefined;
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
      const quiet: Box[] = [...sheet.querySelectorAll(DRAWER_QUIET)]
        .map((element) => element.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({
          left: r.left - origin.left,
          top: r.top - origin.top,
          right: r.right - origin.left,
          bottom: r.bottom - origin.top,
        }));
      const look = drawerLookFor(width);
      const rect = { left: 0, top: 0, right: width, bottom: height };
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      paintMesh(context, meshFacets(rect, look, quiet, null), {
        ...meshColours(sheet),
        edge: look.edge,
        top: 0,
        bottom: height,
        reach: drawerReach(height),
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
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

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
