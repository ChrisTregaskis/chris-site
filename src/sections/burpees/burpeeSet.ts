/** The app's Navy SEAL burpee, one pose per 800ms beat (the app's own timing). Beat numbers mark the counted moves. */
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

/** The pose held when nothing moves (reduced motion): a knee drive, beat 6. */
export const STILL_POSE: Pose = SEAL[6][0];
