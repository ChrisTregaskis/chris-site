import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import {
  milestonesPassed,
  pinTopFor,
  runwayProgress,
} from "@/lib/scrollProgress";
import { topClearance } from "@/lib/topClearance";

interface Layout {
  /** The run's height: the section plus its runway. */
  height: number;
  /** Where the section pins, from the viewport top. */
  pinTop: number;
  runway: number;
}

/**
 * The b3 build lane: the section pins in the middle of the screen (clear of
 * the sticky bar, or bottom-aligned when it can't fit beneath it) while a
 * runway of 2.5 times the track's height (at least 30% of the viewport) plays
 * the track out, so a quick flick can't skip it. Writes the fill straight to
 * the track (`--p`) and reports how many steps are lit. Static (reduced
 * motion): no runway, everything lit.
 */
export function useBuildRunway(steps: number, still: boolean) {
  const runRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [lit, setLit] = useState(still ? steps : 0);

  const size = useCallback(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (still || !section || !track) {
      setLayout(null);
      return;
    }
    const height = section.offsetHeight;
    const runway = Math.max(track.offsetHeight * 2.5, window.innerHeight * 0.3);
    setLayout({
      height: height + runway,
      pinTop: pinTopFor(window.innerHeight, height, topClearance()),
      runway,
    });
  }, [still]);

  useLayoutEffect(() => {
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [size]);

  const drawn = useRef(-1);
  const onFrame = useCallback(() => {
    const run = runRef.current;
    const track = trackRef.current;
    if (!run || !track) return;
    const progress = layout
      ? runwayProgress(
          run.getBoundingClientRect().top,
          layout.pinTop,
          layout.runway,
        )
      : 1;
    if (progress !== drawn.current) {
      drawn.current = progress;
      track.style.setProperty("--p", String(progress));
    }
    setLit(milestonesPassed(progress, steps));
  }, [layout, steps]);

  useScrollFrame(onFrame, true, runRef);

  return { runRef, sectionRef, trackRef, layout, lit };
}
