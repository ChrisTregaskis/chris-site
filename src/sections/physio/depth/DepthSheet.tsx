import { motion } from "framer-motion";
import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, rowsOf, sheetEdge } from "../organisations";
import { apartTiming, HIT_TIMES, MOVE } from "../stackMotion";
import { depthPose, SHEET, sheetHeight, TABLE_H } from "./depthGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface DepthSheetProps {
  org: Org;
  spot: Spot;
  /** Tries to come forward each time this changes; null when not the one asked for. */
  attempt: number | null;
  still: boolean;
}

/** One organisation's rows on its own see-through sheet, in 3D. */
export function DepthSheet({ org, spot, attempt, still }: DepthSheetProps) {
  const apart = spot.at !== "table";
  const { y, z } = depthPose(spot);
  const mine = rowsOf(org);
  const order = spot.at === "held" ? spot.slot : 0;
  const lunge = attempt !== null && attempt > 0 && !still;

  return (
    <div
      data-sheet={org}
      data-spot={spot.at}
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        ...apartTiming(order),
        width: SHEET.w,
        height: TABLE_H,
        transform: `translate3d(0, ${y}px, ${z}px)`,
      }}
    >
      {/* Remounted per attempt, so each one replays. */}
      <motion.div
        key={lunge ? `attempt-${attempt}` : "rest"}
        className="absolute inset-0 [transform-style:preserve-3d]"
        animate={
          lunge ? { y: [0, 48, 0, 16, 0], z: [0, 72, 0, 22, 0] } : undefined
        }
        transition={{
          delay: DURATION.state,
          duration: DURATION.apart,
          ease: [...EASE.lift],
          times: HIT_TIMES,
        }}
      >
        {/* The sheet itself: only there once the table has come apart. */}
        <div
          className={cn(
            MOVE,
            "absolute inset-x-0 top-0 rounded-[14px] bg-raised",
            apart ? "opacity-100" : "opacity-0",
          )}
          style={{
            ...apartTiming(order),
            height: sheetHeight(spot, mine.length),
            boxShadow: sheetEdge(org, spot.at === "result"),
          }}
        />
        <p
          className={cn(
            MOVE,
            "absolute left-5 top-[9px] m-0 flex items-center gap-2 text-[length:calc(19px*var(--k,1))] font-semibold",
            ORG_TINT[org].text,
            apart ? "opacity-100" : "opacity-0",
          )}
          style={apartTiming(order)}
        >
          <i className={cn("size-[9px] rounded-pill", ORG_TINT[org].bg)} />
          {org}
        </p>
        {mine.map(({ row, index }, own) => (
          <div
            key={row.label}
            className={cn(
              MOVE,
              "absolute inset-x-5 grid grid-cols-[12px_1fr_auto] items-center gap-[10px] text-[length:calc(17px*var(--k,1))] text-ink",
            )}
            style={{
              ...apartTiming(order),
              height: SHEET.row,
              transform: `translateY(${SHEET.header + (apart ? own : index) * SHEET.row}px)`,
            }}
          >
            <i className={cn("size-[10px] rounded-pill", ORG_TINT[org].bg)} />
            <span className="leading-none">{row.label}</span>
            <small
              className={cn(
                MOVE,
                "text-[length:calc(16px*var(--k,1))] leading-none text-muted",
                apart ? "opacity-0" : "opacity-100",
              )}
              style={{ transitionDuration: "var(--duration-slow)" }}
            >
              {org}
            </small>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
