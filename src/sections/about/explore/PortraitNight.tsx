import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { PHOTO } from "../photo";
import { smoothstep } from "./portraitMaths";
import { usePortraitScroll } from "./usePortraitScroll";
import { cn } from "@/lib/cn";

/** Through the pass, where the colour starts to come in and where it's all in. */
const COLOUR_FROM = 0.18;
const COLOUR_TO = 0.46;

const IMG =
  "absolute inset-0 block size-full origin-[52%_44%] scale-[1.3] object-cover object-[52%_50%]";

/**
 * Take C, night into day: the photo arrives in the page's own two inks (its
 * shadows in About's ground, its lights in the lilac grey of its muted
 * text), like the drawn case studies above it, and its real colour comes in
 * as it rises to the middle of the screen. Scrolling back up takes it back.
 * A plain soft-cornered frame, so the colour is the one thing that happens.
 * Full colour, still, under reduced motion.
 */
export function PortraitNight() {
  const still = useReducedMotion() ?? false;
  const figureRef = useRef<HTMLElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((t: number) => {
    const night = nightRef.current;
    if (night) {
      night.style.opacity = String(1 - smoothstep(COLOUR_FROM, COLOUR_TO, t));
    }
  }, []);
  usePortraitScroll(figureRef, onProgress, !still);

  return (
    <figure
      ref={figureRef}
      data-portrait="night"
      className="relative mx-auto mb-2 mt-6 aspect-[4/5] w-[min(280px,74vw)] overflow-hidden rounded-sheet wide:mx-0 wide:mb-0 wide:mt-[34px] wide:w-[min(340px,100%)]"
    >
      <img
        src={PHOTO.src}
        alt={PHOTO.alt}
        width={PHOTO.width}
        height={PHOTO.height}
        loading="lazy"
        decoding="async"
        className={IMG}
      />
      {still ? null : (
        // The night version: grey, multiplied into the muted ink, then
        // lifted so nothing is darker than About's ground. Decorative twin.
        <div
          ref={nightRef}
          aria-hidden="true"
          className="absolute inset-0 isolate bg-muted will-change-[opacity]"
        >
          <img
            src={PHOTO.src}
            alt=""
            width={PHOTO.width}
            height={PHOTO.height}
            loading="lazy"
            decoding="async"
            className={cn(IMG, "contrast-[1.15] grayscale mix-blend-multiply")}
          />
          <div className="absolute inset-0 bg-tone-about mix-blend-lighten" />
        </div>
      )}
    </figure>
  );
}
