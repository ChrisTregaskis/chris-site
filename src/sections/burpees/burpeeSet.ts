/** The app's Navy SEAL burpee, one pose per 800ms beat (the app's own timing). Beat numbers show on the counted moves. */
export const SEAL_BEAT_MS = 800;

export type Pose =
  | "stand"
  | "fists-to-hips"
  | "tuck"
  | "plank"
  | "chest"
  | "plank-r-knee"
  | "plank-l-knee";

export const POSES: readonly Pose[] = [
  "stand",
  "fists-to-hips",
  "tuck",
  "plank",
  "chest",
  "plank-r-knee",
  "plank-l-knee",
];

export const SEAL: readonly (readonly [Pose, number | null])[] = [
  ["fists-to-hips", null],
  ["tuck", 1],
  ["plank", 2],
  ["chest", 3],
  ["plank-r-knee", 4],
  ["chest", 5],
  ["plank-l-knee", 6],
  ["chest", 7],
  ["plank", 8],
  ["tuck", 9],
  ["fists-to-hips", 10],
  ["stand", null],
];

/** The frame shown when nothing moves (reduced motion): knee drive, beat 6. */
export const STILL_FRAME = SEAL[6];

const REPS = 100;
const SET_SECONDS = 20 * 60;
/** The ring's circumference (r = 44). */
export const RING_LENGTH = 276.5;

const two = (n: number) => String(n).padStart(2, "0");

/** The phone's readout at a 0 to 1 point through the set: reps done, ring offset, pacing line. */
export function setReadout(progress: number) {
  const left = Math.round(SET_SECONDS * (1 - progress));
  return {
    reps: Math.round(progress * REPS),
    ringOffset: RING_LENGTH * (1 - progress),
    clock: `One every 12.0s, ${two(Math.floor(left / 60))}:${two(left % 60)} left`,
  };
}
