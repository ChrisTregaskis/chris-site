import { motion } from "framer-motion";
import { type Org, ORG_TINT, sheetEdge } from "../organisations";
import { HIT_TIMES } from "../stackMotion";
import { GLASS, slabSpan } from "./glassGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface GlassSlabProps {
  org: Org;
  /** Its column under the glass: table order, so a slab never moves while it's held. */
  column: number;
  /** Held back: lying under the glass. */
  held: boolean;
  /** Lifts at the glass each time this changes; null when not the one asked for. */
  attempt: number | null;
  still: boolean;
}

/** The name strip, turned from lying flat back up to face the viewer. */
const SPINE_FACING = `rotateX(${-90 - GLASS.apart}deg)`;

/**
 * A held sheet, lying flat under the glass floor in its own column, its
 * name on a strip along its front edge turned up to face the viewer. In
 * the leak test, the sheet asked for lifts its far end up through the
 * glass and falls back.
 */
export function GlassSlab({
  org,
  column,
  held,
  attempt,
  still,
}: GlassSlabProps) {
  const lift = attempt !== null && attempt > 0 && !still;
  return (
    <div
      data-slab={org}
      className="absolute top-0 origin-bottom transition-opacity ease-lift [transform-style:preserve-3d] motion-reduce:transition-none"
      style={{
        ...slabSpan(column),
        height: GLASS.slab.depth,
        transform: `translate3d(0, ${GLASS.slab.y - GLASS.slab.depth}px, 0) rotateX(90deg)`,
        opacity: held ? 1 : 0,
        transitionDuration: held
          ? "var(--duration-slow)"
          : "var(--duration-fast)",
        transitionDelay: held ? "var(--duration-together)" : undefined,
      }}
    >
      {/* Remounted per attempt, so each one replays. */}
      <motion.div
        key={lift ? `attempt-${attempt}` : "rest"}
        className="absolute inset-0 origin-bottom [transform-style:preserve-3d]"
        animate={
          lift ? { rotateX: [0, GLASS.lift, 0, GLASS.lift / 4, 0] } : undefined
        }
        transition={{
          delay: DURATION.state,
          duration: DURATION.apart,
          ease: [...EASE.lift],
          times: HIT_TIMES,
        }}
      >
        <div
          className="absolute inset-0 rounded-[8px] bg-raised"
          style={{ boxShadow: sheetEdge(org, false) }}
        />
        <p
          className={cn(
            "absolute inset-x-0 top-full m-0 flex origin-top items-center gap-[7px] rounded-[6px] bg-raised px-[10px] text-[15px] font-semibold leading-none",
            ORG_TINT[org].text,
          )}
          style={{
            height: GLASS.slab.spine,
            transform: SPINE_FACING,
            boxShadow: sheetEdge(org, false),
          }}
        >
          <i className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)} />
          {org}
        </p>
      </motion.div>
    </div>
  );
}
