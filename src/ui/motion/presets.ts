import { type Target, type Transition } from "framer-motion";
import {
  DURATION,
  EASE,
  type EaseToken,
  STAGGER,
  type StaggerToken,
} from "@/ui/tokens/motion";

export type MotionPresetName =
  | "fade"
  | "fadeUp"
  | "lift"
  | "enterFromRight"
  | "enterFromBelow";

export interface MotionPreset {
  initial: Target;
  animate: Target;
  exit: Target;
  /** Always carries a duration, so reduced motion can pin it to 0. */
  transition: Transition & { duration: number };
}

type Bezier = [number, number, number, number];

const bezier = (token: EaseToken): Bezier => [...EASE[token]];

const enter = (offset: Target): MotionPreset => ({
  initial: { opacity: 0, ...offset },
  animate: {
    opacity: 1,
    ...Object.fromEntries(Object.keys(offset).map((key) => [key, 0])),
  },
  exit: { opacity: 0, ...offset },
  transition: { duration: DURATION.enter, ease: bezier("enter") },
});

const FULL: Record<MotionPresetName, MotionPreset> = {
  fade: enter({}),
  fadeUp: enter({ y: 16 }),
  // b3 drawer (from the right) and phone bottom sheet (from below).
  enterFromRight: enter({ x: 40 }),
  enterFromBelow: enter({ y: 40 }),
  // b3 cartridge lift out of its slot.
  lift: {
    initial: { y: 0 },
    animate: { y: -22 },
    exit: { y: 0 },
    transition: { duration: DURATION.slow, ease: bezier("lift") },
  },
};

const REDUCED_FADE: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0 },
};

const REDUCED_STILL: MotionPreset = {
  initial: {},
  animate: {},
  exit: {},
  transition: { duration: 0 },
};

/**
 * The preset for a motion name. Under reduced motion: no transform and no
 * duration; entrances keep only their opacity change, the lift does nothing.
 */
export function resolvePreset(
  name: MotionPresetName,
  reduced: boolean,
): MotionPreset {
  if (!reduced) return FULL[name];
  return name === "lift" ? REDUCED_STILL : REDUCED_FADE;
}

/** Parent transition that staggers its children, or not at all when reduced. */
export function staggerChildren(
  level: StaggerToken,
  reduced: boolean,
): Transition {
  return { staggerChildren: reduced ? 0 : STAGGER[level] };
}
