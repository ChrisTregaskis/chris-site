import { POSES } from "./burpeeSet";
import { floorFor, FRAME_PX, GROUND_LINE_PX } from "./floor";
import { FRAMES } from "./frames";
import { useSealBeat } from "./useSealBeat";
import { cn } from "@/lib/cn";

/** How far each drawing drops so its ground line lands on the box's bottom: a share of its height. */
const DROP = `translateY(${((FRAME_PX - GROUND_LINE_PX) / FRAME_PX) * 100}%)`;

interface SealFigureProps {
  /** Where the count's baseline sits above the bottom of its box, in ems. */
  baseline: number;
  still: boolean;
}

/**
 * The app's drawn figure doing Navy SEALs at the app's beat, stood on the
 * count's baseline in front of it, on a soft ground shadow that follows him
 * from pose to pose (narrow under his feet, the length of his body in a
 * plank). Decorative: the stage it sits in is hidden from assistive tech.
 */
export function SealFigure({ baseline, still }: SealFigureProps) {
  const { figureRef, pose } = useSealBeat(still);
  const floor = floorFor(pose);
  return (
    <span
      ref={figureRef}
      className="absolute right-0 block aspect-square w-[min(46%,30svh)] wide:w-[min(48%,44svh)]"
      style={{ bottom: `${baseline}em` }}
    >
      <span
        className="absolute inset-x-0 bottom-0 block h-[6%] bg-[radial-gradient(closest-side,rgb(var(--color-scrim)/0.85),rgb(var(--color-scrim)/0))] transition-transform duration-base ease-enter motion-reduce:transition-none"
        style={{
          transform: `translate(${floor.shift}%, 50%) scaleX(${floor.scale})`,
        }}
      />
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
