import { useLayoutEffect, useRef } from "react";
import { LINE_LEVELS, type LineLevel } from "./strength";
import { type MeshCanvasOptions, useMeshCanvas } from "./useMeshCanvas";

export type MeshCanvasProps = Omit<MeshCanvasOptions, "level"> & {
  /** How strongly it's drawn in open paper (a level's name: resolved here, in the mesh's own chunk). */
  strength: LineLevel;
};

/**
 * The mesh's layer: the page's full height, behind everything (over the
 * chapters' tone plates, under every line of content), decorative and
 * never in the way of a click. `data-mesh` on the root lets the chapters'
 * plates share its stacking context, so the canvas can lie on top of them
 * (see surface.css).
 */
export function MeshCanvas({
  pointer,
  lines,
  reach,
  strength,
  protect,
}: MeshCanvasProps) {
  const level = LINE_LEVELS[strength];
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-mesh", pointer ? "pointer" : "static");
    return () => root.removeAttribute("data-mesh");
  }, [pointer]);

  useMeshCanvas(layerRef, canvasRef, {
    pointer,
    lines,
    reach,
    level,
    protect,
  });

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-testid="surface-mesh"
      className="surface-mesh pointer-events-none absolute left-0 top-0 w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 block animate-surface-in motion-reduce:animate-none"
      />
    </div>
  );
}
