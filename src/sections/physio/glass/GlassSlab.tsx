import { motion } from "framer-motion";
import { type Org, ORG_TINT, sheetEdge } from "../organisations";
import { HIT_TIMES } from "../stackMotion";
import { GLASS, slabSpan } from "./glassGeometry";
import { shown } from "./glassMotion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface GlassSlabProps {
  org: Org;
  /** Its column under the glass: table order, so a slab never moves. */
  column: number;
  /** Lying under the glass: from the first request on (the table has come apart). */
  apart: boolean;
  /** Its organisation's sheet is what comes back: its tab says so, without moving. */
  selected: boolean;
  /** Lifts at the glass each time this changes; null when not the one asked for. */
  attempt: number | null;
  still: boolean;
}

/** The name strip, turned from lying flat back up to face the viewer. */
const SPINE_FACING = `rotateX(${-90 - GLASS.apart}deg)`;

/**
 * One organisation's place under the glass floor: a sheet lying flat in
 * its own column, its name on a tab along its front edge turned up to face
 * the viewer. Every organisation's lies there, in the same place, from the
 * first request on; the one whose sheet comes back stands on the glass
 * above it, and its tab lights up in its colour. In the leak test, the
 * sheet asked for lifts its far end up through the glass and falls back.
 */
export function GlassSlab({
  org,
  column,
  apart,
  selected,
  attempt,
  still,
}: GlassSlabProps) {
  const lift = attempt !== null && attempt > 0 && !still;
  // In once the rest of the table has tipped over; out quickly.
  const fade = {
    opacity: apart ? 1 : 0,
    transitionDuration: apart ? "var(--duration-slow)" : "var(--duration-fast)",
    transitionDelay: apart ? "var(--duration-together)" : undefined,
  };
  return (
    <div
      data-slab={org}
      data-selected={selected}
      className="absolute top-0 origin-bottom transition-[visibility] [transform-style:preserve-3d] motion-reduce:transition-none"
      style={{
        ...slabSpan(column),
        ...shown(apart),
        transitionDuration: fade.transitionDuration,
        transitionDelay: fade.transitionDelay,
        height: GLASS.slab.depth,
        transform: `translate3d(0, ${GLASS.slab.y - GLASS.slab.depth}px, 0) rotateX(90deg)`,
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
          className="absolute inset-0 rounded-[8px] bg-raised transition-opacity ease-lift motion-reduce:transition-none"
          style={{ ...fade, boxShadow: sheetEdge(org, false) }}
        />
        <p
          data-tab={org}
          className={cn(
            "absolute inset-x-0 top-full m-0 flex origin-top items-center gap-[7px] rounded-[6px] bg-raised px-[10px] text-[15px] font-semibold leading-none transition-[opacity,box-shadow] ease-lift motion-reduce:transition-none",
            ORG_TINT[org].text,
          )}
          style={{
            ...fade,
            height: GLASS.slab.spine,
            transform: SPINE_FACING,
            boxShadow: sheetEdge(org, selected, 20),
          }}
        >
          <i className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)} />
          {org}
        </p>
      </motion.div>
    </div>
  );
}
