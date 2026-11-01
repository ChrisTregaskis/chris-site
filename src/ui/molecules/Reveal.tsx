import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { staggerChildren } from "@/ui/motion/presets";
import { useMotionPreset } from "@/ui/motion/useMotionPreset";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * A list whose items rise into place, one after another, the first time it
 * scrolls into view. Under reduced motion they are simply there.
 */
export function RevealList({ children, className }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.ul
      initial={reduced ? "shown" : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        shown: { transition: staggerChildren("base", reduced) },
      }}
      className={className}
    >
      {children}
    </motion.ul>
  );
}

/** One item of a RevealList. */
export function RevealItem({ children, className }: RevealProps) {
  const preset = useMotionPreset("fadeUp");
  return (
    <motion.li
      variants={{
        hidden: preset.initial,
        shown: { ...preset.animate, transition: preset.transition },
      }}
      className={className}
    >
      {children}
    </motion.li>
  );
}
