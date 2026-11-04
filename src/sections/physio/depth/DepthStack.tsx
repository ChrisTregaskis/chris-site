import { type CSSProperties } from "react";
import { EmptyResult } from "../EmptyResult";
import { type LeakView, spotOf } from "../leakTest";
import { ORGS } from "../organisations";
import { MOVE } from "../stackMotion";
import { TableColumns } from "../TableColumns";
import { DepthPolicy } from "./DepthPolicy";
import { DepthSheet } from "./DepthSheet";
import {
  EMPTY_H,
  RESULT,
  SHEET,
  STACK_H,
  TABLE,
  TABLE_H,
  VANISHING_Y,
  VIEW,
} from "./depthGeometry";
import { cn } from "@/lib/cn";

interface DepthStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
  /**
   * Exploration: draw it shrunk by `scale` as a whole, its type grown by
   * `boost` to make up. Without it, the stack is exactly as shipped.
   */
  fit?: { scale: number; boost: number } | null;
}

/**
 * The sessions table as see-through sheets in real CSS 3D (perspective,
 * preserve-3d), one per organisation: lying as one table at rest, then the
 * result out in front of the policy and the rest held back behind it. Tilts
 * stay shallow so the text you can see stays at about 14px or more on
 * screen. Decorative (the query and its line say it all) and never in the
 * way of a click: its 3D wrappers project over the controls below it.
 */
export function DepthStack({ view, attempt, still, fit }: DepthStackProps) {
  const scene = (
    <div
      aria-hidden="true"
      data-testid="sessions-stack"
      data-drawing="depth"
      className={cn(
        "pointer-events-none relative [perspective:1800px]",
        !fit && "mt-5",
      )}
      style={{
        width: SHEET.w,
        height: STACK_H,
        perspectiveOrigin: `50% ${VANISHING_Y}px`,
      }}
    >
      <div
        className={cn(
          MOVE,
          "absolute inset-x-0 top-[24px] [transform-style:preserve-3d]",
        )}
        style={{
          transitionDuration: "var(--duration-apart)",
          transform: view.asked ? VIEW.apart : VIEW.rest,
        }}
      >
        {/* The one table's plate and its columns, while the sheets lie as one. */}
        <div
          className={cn(
            MOVE,
            "absolute left-0 top-0 rounded-[14px] bg-raised/60",
            view.asked ? "opacity-0" : "opacity-100",
          )}
          style={{
            transitionDuration: "var(--duration-slow)",
            width: SHEET.w,
            height: TABLE_H,
            transform: `translate3d(0, ${TABLE.y}px, ${TABLE.z - 2}px)`,
          }}
        >
          <TableColumns className="absolute inset-x-5 top-[12px] pl-[22px] text-[length:calc(17px*var(--k,1))]" />
        </div>
        {ORGS.map((org) => (
          <DepthSheet
            key={org}
            org={org}
            spot={spotOf(view, org)}
            attempt={view.asking && org === view.target ? attempt : null}
            still={still}
          />
        ))}
        <DepthPolicy
          live={view.asked}
          named={view.testing}
          attempt={attempt}
          still={still}
        />
        <EmptyResult
          shown={view.asked && view.returned === null}
          className="left-0 top-0 rounded-[14px] text-[length:calc(19px*var(--k,1))]"
          style={{
            width: SHEET.w,
            height: EMPTY_H,
            transform: `translate3d(0, ${RESULT.y}px, ${RESULT.z}px)`,
          }}
        />
      </div>
    </div>
  );
  if (!fit) return scene;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mt-3"
      style={{ width: SHEET.w * fit.scale, height: STACK_H * fit.scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={
          {
            transform: `scale(${fit.scale})`,
            "--k": fit.boost,
          } as CSSProperties
        }
      >
        {scene}
      </div>
    </div>
  );
}
