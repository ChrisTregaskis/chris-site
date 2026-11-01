import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { blobPath, STILL_T } from "./blob";
import photo from "@/assets/about/chris-and-son.jpg";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { viewportProgress } from "@/lib/scrollProgress";
import { Section } from "@/ui/molecules/Section";

const CLIP_ID = "about-blob";

/**
 * About: two paragraphs and a photo of Chris with his son in a splash-shaped
 * mask that morphs gently, with a drifting outline, as it scrolls past. Still
 * under reduced motion.
 */
export function AboutSection() {
  const still = useReducedMotion() ?? false;
  const splashRef = useRef<HTMLElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<SVGPathElement>(null);

  const onFrame = useCallback(() => {
    const splash = splashRef.current;
    if (!splash) return;
    const rect = splash.getBoundingClientRect();
    const t = viewportProgress(rect.top, rect.height, window.innerHeight);
    splash.style.transform = `translateY(${(t - 0.5) * -18}px)`;
    clipRef.current?.setAttribute("d", blobPath(t));
    ringRef.current?.setAttribute("d", blobPath(1 - t));
  }, []);
  useScrollFrame(onFrame, !still);

  return (
    <Section id="about" labelledBy="about-title" spacing="roomy">
      <div className="grid gap-7 wide:grid-cols-[1fr_1.6fr]">
        <div>
          <h2
            id="about-title"
            className="m-0 font-display text-display-md font-semibold"
          >
            About
          </h2>
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
                className="fill-accent-strong/[0.16] stroke-accent-strong stroke-[1.5] [vector-effect:non-scaling-stroke]"
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
                src={photo}
                alt="Chris with his son on his shoulders, out walking through the ferns"
                width={720}
                height={962}
                loading="lazy"
                decoding="async"
                className="block size-full origin-[52%_46%] scale-150 object-cover object-[52%_50%]"
              />
            </div>
          </figure>
        </div>
        <div className="self-start wide:self-end">
          <p className="m-0 mb-4 max-w-[34em] text-body-lg">
            I&apos;m a full-stack TypeScript developer who loves turning a rough
            idea into something people use. Toy with the stack, build the proof
            of concept, see what holds. Lately that means AI: agents, MCP
            tooling and chat products, built with a workflow I&apos;ve tuned to
            ship a lot in a short time.
          </p>
          <p className="m-0 mb-4 max-w-[34em] text-body-lg text-muted">
            Tech to one side, it&apos;s the simple joys. My wife and kids,
            family game and film nights, walks across the British countryside,
            dusting off the drums and the odd Steam sale.
          </p>
        </div>
      </div>
    </Section>
  );
}
