import { type CSSProperties } from "react";
import { STACK_H } from "../depth/depthGeometry";
import { FLAT_H } from "../flat/flatGeometry";
import { type QuerySize } from "../QueryLines";
import { type DepthFit } from "./fitDepth";
import { SCENE_BOX_H, ZOOM_CLASSES } from "./sceneMeasures";
import { type PhoneDraft } from "./variant";

export type Drawing = "depth" | "flat" | PhoneDraft;

export interface DrawingPlan {
  /** The phone draft drawn, if it's one. */
  draft: PhoneDraft | null;
  /** Exploration: the 3D stack, shrunk to fit (null: as shipped, or not the 3D stack). */
  shrunk: DepthFit | null;
  /** The room kept for the drawing while it loads: its height, and its gap under the query. */
  room: { height: number | string; className: string };
  query: QuerySize;
  /** The query moves by transform only (exploration). */
  steady: boolean;
  figure: { className: string; style?: CSSProperties };
}

/**
 * How the figure lays out for its drawing: the live chapter's two (3D and
 * flat, `fit` null), or under exploration the 3D stack at its fitted scale
 * or a phone draft.
 */
export function drawingPlan(
  drawing: Drawing,
  fit: DepthFit | null,
): DrawingPlan {
  const steady = fit !== null;
  if (drawing === "flat") {
    return {
      draft: null,
      shrunk: null,
      room: { height: FLAT_H, className: "mt-3" },
      query: "compact",
      steady,
      figure: { className: "max-w-[480px]" },
    };
  }
  if (drawing !== "depth") {
    return {
      draft: drawing,
      shrunk: null,
      room: { height: SCENE_BOX_H, className: "mt-3" },
      query: "compact",
      steady: true,
      figure: { className: `max-w-[480px] ${ZOOM_CLASSES}` },
    };
  }
  if (!fit) {
    return {
      draft: null,
      shrunk: null,
      room: { height: STACK_H, className: "mt-5" },
      query: "large",
      steady,
      figure: { className: "max-w-[560px]" },
    };
  }
  return {
    draft: null,
    shrunk: fit,
    room: { height: STACK_H * fit.scale, className: "mt-3" },
    query: fit.query,
    steady,
    figure: {
      className: "max-w-[560px]",
      // Stacked, an inset keeps the plane's overhang on screen.
      style: fit.inset
        ? { paddingLeft: fit.inset, maxWidth: 560 * fit.scale + fit.inset }
        : undefined,
    },
  };
}
