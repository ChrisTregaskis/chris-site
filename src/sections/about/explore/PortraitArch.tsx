import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { PHOTO } from "../photo";
import { usePortraitScroll } from "./usePortraitScroll";

/** How far the photo drifts inside the arch over the whole pass, in px. */
const DRIFT = 28;

/**
 * Take A, the arch: a tall window with a round head, no frame, no shadow.
 * It shows more of the hillside than the old crop, the sky under the arch's
 * crown, and the photo drifts a little slower than the page behind it, as a
 * view through a window does. Still under reduced motion.
 */
export function PortraitArch() {
  const still = useReducedMotion() ?? false;
  const figureRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((t: number) => {
    const view = viewRef.current;
    if (view) view.style.transform = `translateY(${(t - 0.5) * DRIFT}px)`;
  }, []);
  usePortraitScroll(figureRef, onProgress, !still);

  return (
    <figure
      ref={figureRef}
      data-portrait="arch"
      className="relative mx-auto mb-2 mt-6 aspect-[5/7] w-[min(260px,68vw)] overflow-hidden rounded-t-full wide:mx-0 wide:mb-0 wide:mt-[34px] wide:w-[min(340px,100%)]"
    >
      <div
        ref={viewRef}
        className="absolute inset-x-0 -inset-y-[6%] will-change-transform"
      >
        <img
          src={PHOTO.src}
          alt={PHOTO.alt}
          width={PHOTO.width}
          height={PHOTO.height}
          loading="lazy"
          decoding="async"
          className="block size-full origin-[52%_42%] scale-[1.24] object-cover object-[52%_50%]"
        />
      </div>
    </figure>
  );
}
