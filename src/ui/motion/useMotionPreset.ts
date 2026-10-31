import { useReducedMotion } from "framer-motion";
import {
  type MotionPreset,
  type MotionPresetName,
  resolvePreset,
} from "./presets";

/** A motion preset that respects the visitor's reduced-motion preference. */
export function useMotionPreset(name: MotionPresetName): MotionPreset {
  return resolvePreset(name, useReducedMotion() ?? false);
}
