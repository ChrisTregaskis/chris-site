import { motion } from "framer-motion";
import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, rowsOf, sheetEdge } from "../organisations";
import { HIT_TIMES, MOVE } from "../stackMotion";
import { FLAT, flatPose } from "./flatGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface FlatSheetProps {
  org: Org;
  spot: Spot;
  /** Pushes at the policy each time this changes; null when not the one asked for. */
  attempt: number | null;
  still: boolean;
}

const TIMING = { transitionDuration: "var(--duration-together)" };

/**
 * A row's move: rows fold away quickly as a sheet is held back, and open
 * once a sheet has arrived, so two sheets crossing never show both lists.
 */
function rowTransition(open: boolean, still: boolean): string {
  if (still) return "none";
  const move = "transform var(--duration-together) var(--ease-lift)";
  return open
    ? `${move}, opacity var(--duration-slow) var(--ease-lift) var(--duration-state)`
    : `${move}, opacity var(--duration-fast) linear`;
}

/** One organisation's rows on its own sheet, flat: folded to its tab when held. */
export function FlatSheet({ org, spot, attempt, still }: FlatSheetProps) {
  const mine = rowsOf(org);
  const pose = flatPose(spot, mine.length);
  const atRest = spot.at === "table";
  const lunge = attempt !== null && attempt > 0 && !still;

  return (
    <div
      data-sheet={org}
      data-spot={spot.at}
      className="absolute top-0 transition-[transform,left,right,height] ease-lift motion-reduce:transition-none"
      style={{
        ...TIMING,
        // The one leaving the result goes first.
        transitionDelay:
          spot.at === "result" ? "var(--stagger-base)" : undefined,
        left: pose.inset,
        right: pose.inset,
        height: pose.height,
        zIndex: pose.layer,
        transform: `translateY(${pose.y}px)`,
      }}
    >
      {/* Remounted per attempt, so each one replays. */}
      <motion.div
        key={lunge ? `attempt-${attempt}` : "rest"}
        className="absolute inset-0"
        animate={lunge ? { y: [0, FLAT.lunge, 0, 5, 0] } : undefined}
        transition={{
          delay: DURATION.state,
          duration: DURATION.apart,
          ease: [...EASE.lift],
          times: HIT_TIMES,
        }}
      >
        <div
          className={cn(
            MOVE,
            "absolute inset-0 rounded-[10px] bg-raised",
            atRest ? "opacity-0" : "opacity-100",
          )}
          style={{
            ...TIMING,
            boxShadow: sheetEdge(org, spot.at === "result", 28),
          }}
        />
        <p
          className={cn(
            MOVE,
            "absolute left-3 top-0 m-0 flex h-[20px] items-center gap-[7px] text-[14px] font-semibold leading-none",
            ORG_TINT[org].text,
            atRest ? "opacity-0" : "opacity-100",
          )}
          style={TIMING}
        >
          <i className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)} />
          {org}
        </p>
        {mine.map(({ row, index }, own) => (
          <div
            key={row.label}
            className={cn(
              "absolute inset-x-3 top-0 grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[14px] leading-none text-ink",
              pose.open ? "opacity-100" : "opacity-0",
            )}
            style={{
              transition: rowTransition(pose.open, still),
              height: FLAT.row,
              transform: `translateY(${FLAT.tab + (atRest ? index : own) * FLAT.row}px)`,
            }}
          >
            <i className={cn("size-[8px] rounded-pill", ORG_TINT[org].bg)} />
            <span>{row.label}</span>
            <small
              className={cn(
                MOVE,
                "text-[13px] text-muted",
                atRest ? "opacity-100" : "opacity-0",
              )}
              style={TIMING}
            >
              {org}
            </small>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
