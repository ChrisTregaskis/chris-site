import { motion } from "framer-motion";
import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, rowsOf, sheetEdge } from "../organisations";
import { apartTiming } from "../stackMotion";
import {
  across,
  FACE,
  faceHeight,
  GLASS,
  glassPlace,
  TABLE_FACE_H,
} from "./glassGeometry";
import { MOVE_3D, rowTransition, TIPPING } from "./glassMotion";
import { cn } from "@/lib/cn";
import { DURATION } from "@/ui/tokens/motion";

interface GlassSheetProps {
  org: Org;
  spot: Spot;
  still: boolean;
}

/**
 * One organisation's rows on its own see-through sheet, standing in the
 * glass floor's scene. At rest its rows sit at their places in the one
 * table (the sheets stand as one); as the result it stands on the glass,
 * its rows closed up under its name and its edge glowing; held, it tips
 * over backwards and fades as its slab under the glass takes over. Its size
 * never changes: it moves by transform alone.
 */
export function GlassSheet({ org, spot, still }: GlassSheetProps) {
  const mine = rowsOf(org);
  const height = faceHeight(mine.length);
  const timing = apartTiming(spot.at === "held" ? spot.slot : 0);
  const atRest = spot.at === "table";
  const result = spot.at === "result";
  const open = atRest || result;

  return (
    <div
      data-sheet={org}
      data-spot={spot.at}
      className={cn(MOVE_3D, "absolute top-0 [transform-style:preserve-3d]")}
      style={{
        ...timing,
        ...across(GLASS.inset),
        height: TABLE_FACE_H,
        transform: glassPlace(spot, height),
        transformOrigin: `50% ${height}px`,
      }}
    >
      {/* The plate: there as the result, and briefly as it tips over. */}
      <motion.div
        className="absolute inset-x-0 top-0 rounded-[10px] bg-raised transition-[box-shadow] motion-reduce:transition-none"
        style={{
          height,
          boxShadow: sheetEdge(org, result, 28),
          opacity: still ? Number(result) : undefined,
        }}
        variants={still ? undefined : TIPPING}
        initial={false}
        animate={still ? undefined : spot.at}
        transition={{ duration: DURATION.slow }}
      />
      <p
        className={cn(
          MOVE_3D,
          "absolute top-0 m-0 flex h-[22px] items-center gap-[7px] whitespace-nowrap text-[16px] font-semibold leading-none",
          ORG_TINT[org].text,
          result ? "opacity-100" : "opacity-0",
        )}
        style={{ ...timing, left: FACE.side }}
      >
        <i className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)} />
        {org}
      </p>
      {mine.map(({ row, index }, own) => (
        <div
          key={row.label}
          className="absolute top-0 grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 text-[15px] leading-none text-ink"
          style={{
            left: FACE.side,
            right: FACE.side,
            height: FACE.row,
            transform: `translateY(${FACE.head + (atRest ? index : own) * FACE.row}px)`,
            opacity: open ? 1 : 0,
            transition: rowTransition(open, still),
          }}
        >
          <i className={cn("size-[8px] rounded-pill", ORG_TINT[org].bg)} />
          <span className="truncate">{row.label}</span>
          <small
            className={cn(
              MOVE_3D,
              "text-[15px] text-muted",
              atRest ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: "var(--duration-slow)" }}
          >
            {org}
          </small>
        </div>
      ))}
    </div>
  );
}
