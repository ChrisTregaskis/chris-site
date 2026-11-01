import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";
import { useOdometer } from "./useOdometer";
import { cn } from "@/lib/cn";
import { EASE } from "@/ui/tokens/motion";

export interface OdometerProps {
  /** The number to roll to. */
  value: number;
  /** What to draw for each number on the way. */
  renderItem: (n: number) => ReactNode;
  reducedMotion: boolean;
  className?: string;
}

const ROLL = {
  enter: (direction: number) => ({ y: `${direction * 100}%` }),
  centre: { y: "0%" },
  exit: (direction: number) => ({ y: `${direction * -100}%` }),
};

/**
 * The b3 odometer label: each number rolls in from below (or above, counting
 * down) while the last rolls out. Decorative: pair it with a text value for
 * assistive tech.
 */
export function Odometer({
  value,
  renderItem,
  reducedMotion,
  className,
}: OdometerProps) {
  const { shown, direction, tickMs } = useOdometer(value, reducedMotion);

  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden", className)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          key={shown}
          custom={direction}
          variants={ROLL}
          initial={reducedMotion ? false : "enter"}
          animate="centre"
          exit={reducedMotion ? undefined : "exit"}
          transition={{ duration: tickMs / 1000, ease: [...EASE.tick] }}
          className="absolute inset-0 flex items-center gap-3 whitespace-nowrap will-change-transform"
          data-odometer-value={shown}
        >
          {renderItem(shown)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
