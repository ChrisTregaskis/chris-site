import { type Pose } from "./burpeeSet";

/** The drawings' frame: 512px square, every pose on one shared ground line. */
export const FRAME_PX = 512;

/** The shared ground line, in the frame's pixels from its top. */
export const GROUND_LINE_PX = 505;

/**
 * Where each drawing meets the ground: its first and last point of contact
 * (feet, knees, hands or chest) along the frame, in the frame's pixels.
 * Measured from the art.
 */
export const CONTACT: Record<Pose, readonly [number, number]> = {
  stand: [166, 341],
  "fists-to-hips": [165, 339],
  tuck: [200, 335],
  plank: [70, 410],
  chest: [37, 401],
  "plank-r-knee": [110, 416],
  "plank-l-knee": [81, 433],
};

/** How far the shadow runs past the contact each side, in the frame's pixels: its soft edge, so the hands and feet sit inside the dark. */
const FEATHER_PX = 28;

export interface Floor {
  /** The shadow's centre, as a percentage of the frame's width from its centre (negative: left). */
  shift: number;
  /** The shadow's width as a share of the frame's width (0 to 1). */
  scale: number;
}

/**
 * The ground shadow under a pose: a soft ellipse across its contact with the
 * floor, narrow under the feet when standing, the length of the body in a
 * plank. Expressed as one transform on a full-width ellipse, so a change of
 * pose is a cheap, animatable translate and scale.
 */
export function floorFor(pose: Pose): Floor {
  const [from, to] = CONTACT[pose];
  const left = Math.max(0, from - FEATHER_PX);
  const right = Math.min(FRAME_PX, to + FEATHER_PX);
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    shift: round(((left + right) / 2 / FRAME_PX - 0.5) * 100),
    scale: round((right - left) / FRAME_PX),
  };
}
