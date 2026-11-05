import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { PHOTO } from "../photo";
import { smoothstep } from "./portraitMaths";
import { usePortraitScroll } from "./usePortraitScroll";

/** Through the pass, where the photo starts to lift and where it's up. */
const LIFT_FROM = 0.14;
const LIFT_TO = 0.42;

/** How high the photo lifts off its seat, in px. */
const LIFT = 22;

/**
 * Take D, lifted: a plain circle, lifted off its seat the way the Wayfinder
 * figure's pieces lift off the plate, leaving the seat drawn where it sat
 * (the figure's own footprint: a faint lilac fill and a fine dashed line).
 * It rises as it comes up the screen. Up, still, under reduced motion.
 */
export function PortraitLifted() {
  const still = useReducedMotion() ?? false;
  const figureRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((t: number) => {
    const photo = photoRef.current;
    if (photo) {
      photo.style.transform = `translateY(${(-LIFT * smoothstep(LIFT_FROM, LIFT_TO, t)).toFixed(2)}px)`;
    }
  }, []);
  usePortraitScroll(figureRef, onProgress, !still);

  return (
    <figure
      ref={figureRef}
      data-portrait="lifted"
      className="relative mx-auto mb-2 mt-10 aspect-square w-[min(270px,72vw)] wide:mx-0 wide:mb-0 wide:mt-[56px] wide:w-[min(340px,100%)]"
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
      >
        <circle
          cx="50"
          cy="50"
          r="49.6"
          vectorEffect="non-scaling-stroke"
          className="fill-accent/[0.06] stroke-accent/50 stroke-1 [stroke-dasharray:3_3]"
        />
      </svg>
      <div
        ref={photoRef}
        className="absolute inset-0 overflow-hidden rounded-full will-change-transform"
        style={{ transform: `translateY(${-LIFT}px)` }}
      >
        <img
          src={PHOTO.src}
          alt={PHOTO.alt}
          width={PHOTO.width}
          height={PHOTO.height}
          loading="lazy"
          decoding="async"
          className="block size-full origin-[52%_46%] scale-[1.4] object-cover object-[52%_50%]"
        />
      </div>
    </figure>
  );
}
