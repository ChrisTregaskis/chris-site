import { motion } from "framer-motion";
import { POLICY_RULE } from "../organisations";
import { FLASH_TIMES } from "../stackMotion";
import { FLAT_BOX_H, FLAT_LAYER, FLAT_RULE_Y } from "./flatGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface FlatPolicyProps {
  /** In from the first request on: the policy is always on. */
  live: boolean;
  /** Named and brought up for the leak test, which is testing it. */
  named: boolean;
  /** Flashes each time this changes (an attempt hitting it); 0 is at rest. */
  attempt: number;
  still: boolean;
}

/** The policy, flat: a veiled box over the rest of the table, its rule along the bottom. */
export function FlatPolicy({ live, named, attempt, still }: FlatPolicyProps) {
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
        "absolute inset-x-0 top-0 transition-opacity ease-lift motion-reduce:transition-none",
        live ? "opacity-100" : "opacity-0",
      )}
      style={{
        height: FLAT_BOX_H,
        zIndex: FLAT_LAYER.policy,
        transitionDuration: "var(--duration-slow)",
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
        transition={hit}
      />
      {/* Named on the box's top edge, like a legend, clear of the tabs: the panel's ground behind it breaks the dashes. */}
      <p
        className={cn(
          "absolute -top-[10px] right-3 m-0 bg-surface px-[6px] text-[13px] font-semibold leading-[18px] text-accent transition-opacity duration-slow motion-reduce:transition-none wide:bg-tone-physio",
          named ? "opacity-100" : "opacity-0",
        )}
      >
        row-level security
      </p>
      <p
        className={cn(
          "absolute left-3 m-0 whitespace-nowrap text-[13px] font-medium leading-[18px] transition-colors duration-slow motion-reduce:transition-none",
          named ? "text-accent" : "text-muted",
        )}
        style={{ top: FLAT_RULE_Y }}
      >
        {POLICY_RULE}
      </p>
    </div>
  );
}
