import { type Pose } from "./burpeeSet";
import chest from "@/assets/burpees/chest.webp";
import fistsToHips from "@/assets/burpees/fists-to-hips.webp";
import plank from "@/assets/burpees/plank.webp";
import plankLKnee from "@/assets/burpees/plank-l-knee.webp";
import plankRKnee from "@/assets/burpees/plank-r-knee.webp";
import stand from "@/assets/burpees/stand.webp";
import tuck from "@/assets/burpees/tuck.webp";

/** The app's seven drawings, one per pose (512px, one ground line, one shared crop). */
export const FRAMES: Record<Pose, string> = {
  stand,
  "fists-to-hips": fistsToHips,
  tuck,
  plank,
  chest,
  "plank-r-knee": plankRKnee,
  "plank-l-knee": plankLKnee,
};
