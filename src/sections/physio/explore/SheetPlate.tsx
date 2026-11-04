import { motion } from "framer-motion";
import { type CSSProperties } from "react";
import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, sheetEdge } from "../organisations";
import { FACE } from "./sceneMeasures";
import { MOVE_3D, TIPPING } from "./sheetMotion";
import { cn } from "@/lib/cn";
import { DURATION } from "@/ui/tokens/motion";

interface SheetPlateProps {
  org: Org;
  spot: Spot;
  /** The plate's height: its own rows. */
  height: number;
  timing: CSSProperties;
  /** An index tab at this column (of three), above the plate (draft B). */
  tab?: number;
  /** Held, the body runs this deep instead (draft B's drawer). */
  heldDepth?: number;
  /** Shows as it tips over when held, then goes (draft C). */
  tipping: boolean;
  still: boolean;
}

/** Where a tab sits across the sheet, as CSS. */
export function tabLeft(tab: number): string {
  return `calc(${tab} * (100% - 12px) / 3)`;
}

/**
 * Exploration: a phone sheet's plate, only there once the table has come
 * apart: plain (A, C), or an index card's tab and body (B), whose body runs
 * down into the drawer while it's held.
 */
export function SheetPlate({
  org,
  spot,
  height,
  timing,
  tab,
  heldDepth,
  tipping,
  still,
}: SheetPlateProps) {
  const atRest = spot.at === "table";
  const result = spot.at === "result";
  const edge = sheetEdge(org, result, 28);
  if (tipping) {
    return (
      <motion.div
        className="absolute inset-x-0 top-0 rounded-[10px] bg-raised transition-[box-shadow] motion-reduce:transition-none"
        style={{
          height,
          boxShadow: edge,
          opacity: still ? Number(result) : undefined,
        }}
        variants={still ? undefined : TIPPING}
        initial={false}
        animate={still ? undefined : spot.at}
        transition={{ duration: DURATION.slow }}
      />
    );
  }
  const tabbed = tab !== undefined;
  const deep = heldDepth !== undefined && spot.at === "held";
  const top = tabbed ? FACE.head - 2 : 0;
  return (
    <>
      <div
        className={cn(
          MOVE_3D,
          "absolute inset-x-0 rounded-[10px] bg-raised",
          atRest || deep ? "opacity-0" : "opacity-100",
        )}
        style={{ ...timing, top, height: height - top, boxShadow: edge }}
      />
      {heldDepth === undefined ? null : (
        <div
          className={cn(
            MOVE_3D,
            "absolute inset-x-0 rounded-[10px] bg-raised",
            deep ? "opacity-100" : "opacity-0",
          )}
          style={{ ...timing, top, height: heldDepth, boxShadow: edge }}
        />
      )}
      {tabbed ? (
        <div
          className={cn(
            MOVE_3D,
            "absolute top-0 rounded-t-[9px] border-[1.5px] border-b-0 bg-raised",
            atRest ? "opacity-0" : "opacity-100",
          )}
          style={{
            ...timing,
            left: tabLeft(tab),
            width: "calc((100% - 12px) / 3)",
            height: FACE.head + 1,
            borderColor: `rgb(var(--color-${ORG_TINT[org].token}) / ${result ? 0.95 : 0.4})`,
          }}
        />
      ) : null}
    </>
  );
}
