import { motion } from "framer-motion";
import { POLICY_RULE } from "../organisations";
import { FLASH_TIMES } from "../stackMotion";
import { type SheetPlace } from "./sheetMotion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface PhonePolicyProps {
  /** In from the first request on: the policy is always on. */
  live: boolean;
  /** Named and brought up for the leak test, which is testing it. */
  named: boolean;
  /** Flashes each time this changes (an attempt hitting it); 0 is at rest. */
  attempt: number;
  place: SheetPlace;
  left: string;
  width: string;
  height: number;
  /** Where its rule sits, down the plane. */
  ruleTop: number;
  /** Turns its words back towards the viewer, so the scene's tilt doesn't squash them. */
  facing?: string;
  /** Its name sits on its top edge (like a legend), or inside it this far down, on the right. */
  legendTop?: number;
  still: boolean;
}

/**
 * Exploration: the policy in a phone drawing, a see-through dashed plane
 * between what comes back and the rest of the table. Named on its top edge
 * (like a legend, the panel's ground breaking the dashes) once the leak
 * test is open; its rule written across it.
 */
export function PhonePolicy({
  live,
  named,
  attempt,
  place,
  left,
  width,
  height,
  ruleTop,
  facing,
  legendTop,
  still,
}: PhonePolicyProps) {
  const onEdge = legendTop === undefined;
  const flash = attempt > 0 && !still;
  return (
    <div
      data-policy
      className="absolute top-0 transition-[transform,opacity] ease-lift [transform-style:preserve-3d] motion-reduce:transition-none"
      style={{
        left,
        width,
        height,
        transform: place.transform,
        transformOrigin: place.origin ?? "0 0",
        opacity: live ? 1 : 0,
        transitionDuration: "var(--duration-apart)",
        transitionDelay: live ? "var(--duration-state)" : undefined,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[12px] border-2 border-dashed bg-surface/65 transition-[border-color,box-shadow] duration-slow motion-reduce:transition-none",
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
        animate={flash ? { opacity: [0, 0, 0.3, 0] } : { opacity: 0 }}
        transition={{
          delay: DURATION.state,
          duration: DURATION.apart,
          times: FLASH_TIMES,
        }}
      />
      <p
        className={cn(
          "absolute right-3 m-0 px-[6px] text-[15px] font-semibold leading-[20px] text-accent transition-opacity duration-slow motion-reduce:transition-none",
          onEdge
            ? "-top-[11px] origin-bottom bg-surface wide:bg-tone-physio"
            : "origin-left",
          named ? "opacity-100" : "opacity-0",
        )}
        style={{ top: legendTop, transform: facing }}
      >
        row-level security
      </p>
      <p
        className={cn(
          "absolute left-3 m-0 origin-left whitespace-nowrap text-[14px] font-medium leading-[18px] transition-colors duration-slow motion-reduce:transition-none",
          named ? "text-accent" : "text-muted",
        )}
        style={{ top: ruleTop, transform: facing }}
      >
        {POLICY_RULE}
      </p>
    </div>
  );
}
