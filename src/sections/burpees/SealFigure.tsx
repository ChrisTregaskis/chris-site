import { POSES } from "./burpeeSet";
import { FRAMES } from "./frames";
import { useSealBeat } from "./useSealBeat";
import { cn } from "@/lib/cn";

/** The drawings' frame: 512px square, every pose on one ground line 505px down. */
const FRAME_PX = 512;
const GROUND_LINE_PX = 505;

/** How far each drawing drops so its ground line lands on the box's bottom: a share of its height. */
const DROP = `translateY(${((FRAME_PX - GROUND_LINE_PX) / FRAME_PX) * 100}%)`;

interface SealFigureProps {
  /** Where the count's baseline sits above the bottom of its box, in ems. */
  baseline: number;
  still: boolean;
}

/**
 * The app's drawn figure doing Navy SEALs at the app's beat, stood on the
 * count's baseline in front of it. Decorative: the stage it sits in is
 * hidden from assistive tech.
 */
export function SealFigure({ baseline, still }: SealFigureProps) {
  const { figureRef, pose } = useSealBeat(still);
  return (
    <span
      ref={figureRef}
      className="absolute right-0 block aspect-square w-[min(46%,30svh)] wide:w-[min(48%,44svh)]"
      style={{ bottom: `${baseline}em` }}
    >
      {POSES.map((name) => (
        <img
          key={name}
          src={FRAMES[name]}
          alt=""
          width={FRAME_PX}
          height={FRAME_PX}
          loading="lazy"
          decoding="async"
          className={cn(
            "pointer-events-none absolute inset-0 size-full select-none",
            name === pose ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: DROP }}
        />
      ))}
    </span>
  );
}
