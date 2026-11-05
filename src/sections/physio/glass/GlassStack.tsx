import { type CSSProperties } from "react";
import { EmptyResult } from "../EmptyResult";
import { type LeakView, spotOf } from "../leakTest";
import { ORGS } from "../organisations";
import { MOVE } from "../stackMotion";
import { TableColumns } from "../TableColumns";
import { GlassPolicy } from "./GlassPolicy";
import { GlassSheet } from "./GlassSheet";
import { GlassSlab } from "./GlassSlab";
import {
  across,
  FACING,
  GLASS,
  glassView,
  SCENE_BOX_H,
  SCENE_H,
  TABLE_FACE_H,
} from "./glassGeometry";
import { cn } from "@/lib/cn";

interface GlassStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
}

/**
 * The sessions table for phones (and any screen too small for the 3D
 * stack), as a glass floor in real CSS 3D: the rest of the table tips over
 * and lies flat under the policy's glass, and what comes back stands on it,
 * facing you. Drawn in a box as wide as its column and one height in every
 * state (`SCENE_BOX_H`, zoomed a little on taller screens), so the pinned
 * panel never grows. Decorative (the query and its line say it all) and
 * never in the way of a tap.
 */
export function GlassStack({ view, attempt, still }: GlassStackProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="sessions-stack"
      data-drawing="glass"
      className="pointer-events-none relative mt-3 w-full"
      style={{ height: SCENE_BOX_H }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={
          {
            width: "calc(100% / var(--pk, 1))",
            height: SCENE_H,
            transform: "scale(var(--pk, 1))",
            perspective: `${GLASS.perspective}px`,
            perspectiveOrigin: `50% ${GLASS.eyeY}px`,
          } as CSSProperties
        }
      >
        <div
          className={cn(MOVE, "absolute inset-0 [transform-style:preserve-3d]")}
          style={{
            transitionDuration: "var(--duration-apart)",
            transform: glassView(view.asked),
            transformOrigin: `50% ${GLASS.y}px`,
          }}
        >
          {/* The one table's plate and its columns, while the sheets stand as one. */}
          <div
            className={cn(
              MOVE,
              "absolute top-0 rounded-[10px] bg-raised/60",
              view.asked ? "opacity-0" : "opacity-100",
            )}
            style={{
              ...across(GLASS.inset),
              height: TABLE_FACE_H,
              transitionDuration: "var(--duration-slow)",
              transform: `translate3d(0, ${GLASS.table.y}px, -1px)`,
            }}
          >
            <TableColumns className="h-[22px] items-center px-3 pl-[28px] text-[14px] leading-none" />
          </div>
          <GlassPolicy
            live={view.asked}
            named={view.testing}
            attempt={attempt}
            still={still}
          />
          {ORGS.map((org) => (
            <GlassSheet
              key={org}
              org={org}
              spot={spotOf(view, org)}
              still={still}
            />
          ))}
          {ORGS.map((org, column) => (
            <GlassSlab
              key={org}
              org={org}
              column={column}
              held={spotOf(view, org).at === "held"}
              attempt={view.asking && org === view.target ? attempt : null}
              still={still}
            />
          ))}
          <EmptyResult
            shown={view.asked && view.returned === null}
            className="top-0 origin-bottom rounded-[10px] text-[16px]"
            style={{
              ...across(GLASS.inset),
              height: GLASS.emptyH,
              transform: `translate3d(0, ${GLASS.y - GLASS.emptyH}px, ${GLASS.stand.z + 1}px) ${FACING}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
