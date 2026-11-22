import { useLayoutEffect, useRef } from "react";
import { useMeshCanvas } from "./useMeshCanvas";

export interface MeshCanvasProps {
  /** Whether the facets press in under the mouse (B2), or hold still (B1). */
  pointer: boolean;
  /** Whether the net's edges are drawn in faint pencil over its facets. */
  lines: boolean;
}

/**
 * The mesh's layer: the page's full height, behind everything (over the
 * chapters' tone plates, under every line of content), decorative and
 * never in the way of a click. `data-mesh` on the root lets the chapters'
 * plates share its stacking context, so the canvas can lie on top of them
 * (see surface.css).
 */
export function MeshCanvas({ pointer, lines }: MeshCanvasProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-mesh", pointer ? "pointer" : "static");
    return () => root.removeAttribute("data-mesh");
  }, [pointer]);

  useMeshCanvas(layerRef, canvasRef, pointer, lines);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-testid="surface-mesh"
      className="surface-mesh pointer-events-none absolute left-0 top-0 w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute left-0 top-0 block" />
    </div>
  );
}
