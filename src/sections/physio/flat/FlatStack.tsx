import { EmptyResult } from "../EmptyResult";
import { type LeakView, spotOf } from "../leakTest";
import { ORGS } from "../organisations";
import { TableColumns } from "../TableColumns";
import { FlatPolicy } from "./FlatPolicy";
import { FlatSheet } from "./FlatSheet";
import {
  FLAT_EMPTY_H,
  FLAT_H,
  FLAT_LAYER,
  FLAT_RESULT_Y,
  FLAT_TABLE_H,
} from "./flatGeometry";
import { cn } from "@/lib/cn";

interface FlatStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
}

/**
 * The sessions table drawn flat, for phones and narrow screens: the same
 * spots as the 3D stack without the perspective. Decorative (the query and
 * its line say it all).
 */
export function FlatStack({ view, attempt, still }: FlatStackProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="sessions-stack"
      data-drawing="flat"
      className="pointer-events-none relative mt-2 w-full wide:mt-3"
      style={{ height: FLAT_H }}
    >
      {/* The one table's plate and its columns, while the sheets lie as one. */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 rounded-[10px] bg-raised/60 transition-opacity duration-slow motion-reduce:transition-none",
          view.asked ? "opacity-0" : "opacity-100",
        )}
        style={{ height: FLAT_TABLE_H }}
      >
        <TableColumns className="h-[20px] items-center px-3 pl-[28px] text-[13px] leading-none" />
      </div>
      {ORGS.map((org) => (
        <FlatSheet
          key={org}
          org={org}
          spot={spotOf(view, org)}
          attempt={view.asking && org === view.target ? attempt : null}
          still={still}
        />
      ))}
      <FlatPolicy
        live={view.asked}
        named={view.testing}
        attempt={attempt}
        still={still}
      />
      <EmptyResult
        shown={view.asked && view.returned === null}
        className="inset-x-0 top-0 rounded-[10px] text-[15px]"
        style={{
          height: FLAT_EMPTY_H,
          zIndex: FLAT_LAYER.result,
          transform: `translateY(${FLAT_RESULT_Y}px)`,
        }}
      />
    </div>
  );
}
