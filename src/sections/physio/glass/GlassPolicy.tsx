import { motion } from "framer-motion";
import { POLICY_RULE } from "../organisations";
import { FLASH_TIMES } from "../stackMotion";
import { across, FACING, GLASS } from "./glassGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface GlassPolicyProps {
  /** In from the first request on: the policy is always on. */
  live: boolean;
  /** Named and brought up for the leak test, which is testing it. */
  named: boolean;
  /** Flashes each time this changes (an attempt hitting it); 0 is at rest. */
  attempt: number;
  still: boolean;
}

/**
 * The policy as a glass floor: a dashed, see-through pane lying flat,
 * running back from its front edge, and that edge turned up to face the
 * viewer. There's no room on a phone for both the policy's rule and its
 * name, so the edge carries the rule (step 2), then the policy's name,
 * row-level security (step 3).
 */
export function GlassPolicy({ live, named, attempt, still }: GlassPolicyProps) {
  const glass = across(GLASS.edge.inset);
  const flash = attempt > 0 && !still;
  const timing = {
    transitionDuration: "var(--duration-apart)",
    transitionDelay: live ? "var(--duration-state)" : undefined,
  };
  return (
    <>
      {/* The glass: lying flat, running back from its front edge. */}
      <div
        data-policy
        className="absolute top-0 origin-bottom transition-[transform,opacity] ease-lift [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{
          ...glass,
          ...timing,
          height: GLASS.depth,
          transform: `translate3d(0, ${GLASS.y - GLASS.depth + (live ? 0 : 24)}px, 0) rotateX(90deg)`,
          opacity: live ? 1 : 0,
        }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[12px] border-2 border-dashed bg-surface/55 transition-[border-color,box-shadow] duration-slow motion-reduce:transition-none",
            named
              ? "border-accent shadow-[0_0_40px_-14px_rgb(var(--color-accent)/0.55)]"
              : "border-line-strong",
          )}
        />
        {/* A soft flash as the policy is named; a hard one each time an attempt hits it. */}
        <motion.span
          key={named ? "named" : "quiet"}
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={named && !still ? { opacity: [0, 0.14, 0] } : { opacity: 0 }}
          transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
        />
        <motion.span
          key={`attempt-${attempt}`}
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={flash ? { opacity: [0, 0, 0.35, 0] } : { opacity: 0 }}
          transition={{
            delay: DURATION.state,
            duration: DURATION.apart,
            times: FLASH_TIMES,
          }}
        />
      </div>
      {/* The glass's front edge, facing you: its rule, then (step 3) its name. */}
      <div
        className={cn(
          "absolute top-0 origin-top rounded-b-[8px] border-2 border-t-0 border-dashed bg-surface transition-[transform,opacity,border-color] ease-lift motion-reduce:transition-none wide:bg-tone-physio",
          named ? "border-accent" : "border-line-strong",
        )}
        style={{
          ...glass,
          ...timing,
          height: GLASS.edge.h,
          transform: `translate3d(0, ${GLASS.y + (live ? 0 : 24)}px, 0) ${FACING}`,
          opacity: live ? 1 : 0,
        }}
      >
        <p
          className={cn(
            "absolute inset-0 m-0 flex items-center whitespace-nowrap px-3 text-[14px] font-medium leading-none text-muted transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-0" : "opacity-100",
          )}
        >
          {POLICY_RULE}
        </p>
        <p
          className={cn(
            "absolute inset-0 m-0 flex items-center px-3 text-[15px] font-semibold leading-none text-accent transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-100" : "opacity-0",
          )}
        >
          row-level security
        </p>
      </div>
    </>
  );
}
