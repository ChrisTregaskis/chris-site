import { motion } from "framer-motion";
import { POLICY_RULE } from "../organisations";
import { FLASH_TIMES, MOVE } from "../stackMotion";
import { PLANE, SHEET } from "./depthGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface DepthPolicyProps {
  /** In from the first request on: the policy is always on. */
  live: boolean;
  /** Named and brought up for the leak test, which is testing it. */
  named: boolean;
  /** Flashes each time this changes (an attempt hitting it); 0 is at rest. */
  attempt: number;
  still: boolean;
}

/** The policy, in 3D: a veil between the result and the rest of the table. */
export function DepthPolicy({ live, named, attempt, still }: DepthPolicyProps) {
  const flash = attempt > 0 && !still;
  const hit = {
    delay: DURATION.state,
    duration: DURATION.apart,
    times: FLASH_TIMES,
  };
  return (
    <div
      data-policy
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        transitionDuration: "var(--duration-apart)",
        transitionDelay: live ? "var(--duration-state)" : undefined,
        width: SHEET.w + 2 * PLANE.overhang,
        height: PLANE.h,
        transform: `translate3d(${-PLANE.overhang * (live ? 1 : 2)}px, ${PLANE.y}px, ${PLANE.z}px)`,
        opacity: live ? 1 : 0,
      }}
    >
      {/* Remounted per attempt, so each one replays the hit. */}
      <motion.div
        key={`policy-${attempt}`}
        className={cn(
          "absolute inset-0 rounded-[14px] border-2 border-dashed bg-surface/65 transition-[border-color,box-shadow] duration-slow motion-reduce:transition-none",
          named
            ? "border-accent shadow-[0_0_72px_-20px_rgb(var(--color-accent)/0.55)]"
            : "border-line-strong",
        )}
        animate={flash ? { scale: [1, 1, 1.015, 1] } : undefined}
        transition={hit}
      >
        <motion.span
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={flash ? { opacity: [0, 0, 0.28, 0] } : { opacity: 0 }}
          transition={hit}
        />
        <div className="absolute bottom-3 left-6 whitespace-nowrap">
          <p
            className={cn(
              "m-0 text-[18px] font-semibold text-accent transition-opacity duration-slow motion-reduce:transition-none",
              named ? "opacity-100" : "opacity-0",
            )}
          >
            row-level security
          </p>
          <p
            className={cn(
              "m-0 text-[16px] font-medium transition-colors duration-slow motion-reduce:transition-none",
              named ? "text-accent" : "text-muted",
            )}
          >
            {POLICY_RULE}
          </p>
        </div>
      </motion.div>
      {/* A soft flash, once, as the policy is named for the leak test. */}
      <motion.span
        key={named ? "named" : "quiet"}
        className="absolute inset-0 rounded-[14px] bg-accent"
        initial={{ opacity: 0 }}
        animate={named && !still ? { opacity: [0, 0.14, 0] } : { opacity: 0 }}
        transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
      />
    </div>
  );
}
