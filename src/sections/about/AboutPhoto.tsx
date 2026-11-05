import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { blobPath, STILL_T } from "./blob";
import { PHOTO } from "./photo";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { viewportProgress } from "@/lib/scrollProgress";

const CLIP_ID = "about-blob";

/**
 * The About photo of Chris with his son, in a splash-shaped mask that morphs
 * gently, with a drifting outline, as it scrolls past. Still under reduced
 * motion.
 */
export function AboutPhoto() {
  const still = useReducedMotion() ?? false;
  const splashRef = useRef<HTMLElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<SVGPathElement>(null);

  const drawn = useRef(-1);
  const onFrame = useCallback(() => {
    const splash = splashRef.current;
    if (!splash) return;
    const rect = splash.getBoundingClientRect();
    // A thousandth of the way through is finer than a pixel of drift: skip
    // rewriting the transform and both paths when nothing would change.
    const t =
      Math.round(
        viewportProgress(rect.top, rect.height, window.innerHeight) * 1000,
      ) / 1000;
    if (t === drawn.current) return;
    drawn.current = t;
    splash.style.transform = `translateY(${(t - 0.5) * -18}px)`;
    clipRef.current?.setAttribute("d", blobPath(t));
    ringRef.current?.setAttribute("d", blobPath(1 - t));
  }, []);
  useScrollFrame(onFrame, !still, splashRef);

  return (
    <figure
      ref={splashRef}
      className="relative mx-auto mb-2 mt-6 aspect-[1/1.08] w-[min(280px,74vw)] will-change-transform wide:mx-0 wide:mb-0 wide:mt-[34px] wide:w-[min(360px,100%)]"
    >
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full translate-x-4 translate-y-[14px] -rotate-[4deg] overflow-visible"
      >
        <path
          ref={ringRef}
          d={blobPath(1 - STILL_T)}
          className="fill-accent-strong/[0.28] stroke-none"
        />
      </svg>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        className="absolute"
      >
        <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
          <path ref={clipRef} d={blobPath(STILL_T)} />
        </clipPath>
      </svg>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `url(#${CLIP_ID})` }}
      >
        <img
          src={PHOTO.src}
          alt={PHOTO.alt}
          width={PHOTO.width}
          height={PHOTO.height}
          loading="lazy"
          decoding="async"
          className="block size-full origin-[52%_46%] scale-150 object-cover object-[52%_50%]"
        />
      </div>
    </figure>
  );
}
