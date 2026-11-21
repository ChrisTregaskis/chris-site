import { motion, useReducedMotion } from "framer-motion";
import { useBuildRunway } from "./useBuildRunway";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";
import { useMotionPreset } from "@/ui/motion/useMotionPreset";

const STEPS = [
  { name: "Spec", text: "What it must do, written before code." },
  { name: "Plan", text: "Small tasks with clear finish lines." },
  {
    name: "AI-assisted build",
    text: "From my architecture and design, one step at a time, reviewed as it goes.",
  },
  { name: "Review gates", text: "Tests, types, lint and my own read." },
  { name: "Ship", text: "Deployed from CI, infrastructure as code." },
] as const;

/** The eval bench note shows once the lane reaches this many lit steps (Review gates). */
const BENCH_AFTER = 4;

const BENCH = {
  name: "Eval bench",
  text: "A regression suite of conversation scenarios, run before every release. Free text means endless possible conversations, so it covers as many as is sensible rather than every edge case, and catches anything that got worse before it ships.",
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * The eval bench: a companion note under the lane, not a step on it. Side by
 * side it sits in the pinned section, set to the lane's end under the build,
 * review and ship steps (the stages it guards);
 * stacked, it follows the pinned run (so the lane still fits a phone's
 * screen), lined up with the steps' text. It rises in as the lane reaches
 * Review gates (static under reduced motion, where the lane is lit from the
 * start).
 */
function BenchNote({ shown, stacked }: { shown: boolean; stacked: boolean }) {
  const preset = useMotionPreset("fadeUp");
  return (
    <div
      className={cn(
        "pl-[34px] wide:grid wide:grid-cols-5 wide:gap-x-4 wide:pl-0",
        stacked ? "pb-[clamp(40px,6vw,80px)]" : "mt-7",
      )}
    >
      <motion.aside
        aria-labelledby="bench-title"
        initial={false}
        animate={shown ? preset.animate : preset.initial}
        transition={preset.transition}
        className="flex max-w-[640px] flex-col gap-3 sheet:flex-row sheet:items-center sheet:gap-4 wide:col-span-3 wide:col-start-3 wide:justify-self-end"
      >
        <span aria-hidden="true" className="shrink-0 text-ink">
          <svg viewBox="0 0 24 24" className="size-[30px]">
            <path
              d="M9 3h6M10 3v6l-5.2 9.2A1.9 1.9 0 0 0 6.5 21h11a1.9 1.9 0 0 0 1.7-2.8L14 9V3"
              {...stroke}
            />
            <path d="M7.2 15h9.6" {...stroke} />
          </svg>
        </span>
        <div className="text-[15px] leading-[1.6] text-muted">
          <h4
            id="bench-title"
            className="m-0 mb-1 font-display text-[22px] font-medium leading-[normal] text-ink"
          >
            {BENCH.name}
          </h4>
          <p className="m-0">{BENCH.text}</p>
        </div>
      </motion.aside>
    </div>
  );
}

/**
 * How Wayfinder was built: five stages measured off one by one as the
 * section is scrolled through, with the eval bench as a note beneath. The
 * lane is a dimension line (the look's signature, as the chapter rails are):
 * a pencil line with an oblique tick at each stage, which the red pen draws
 * over and ticks off as it goes.
 */
export function BuildStory() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const { runRef, sectionRef, trackRef, layout, lit } = useBuildRunway(
    STEPS.length,
    still,
    stacked,
  );
  const bench = <BenchNote shown={lit >= BENCH_AFTER} stacked={stacked} />;

  return (
    <>
      {/* An in-page link lands where the lane pins with its line undrawn. */}
      <div
        ref={runRef}
        id="how-it-was-built"
        className="relative"
        style={
          layout
            ? { height: layout.height, scrollMarginTop: layout.pinTop }
            : undefined
        }
      >
        <section
          ref={sectionRef}
          aria-labelledby="build-title"
          className={cn("py-[clamp(40px,6vw,80px)]", layout && "sticky")}
          style={layout ? { top: layout.pinTop } : undefined}
        >
          <h3
            id="build-title"
            className="m-0 mb-2 font-display text-title-lg font-medium leading-[normal]"
          >
            How it was built
          </h3>
          <p className="m-0 mb-7 text-muted">
            One person carrying the whole stack, because the workflow does the
            carrying.
          </p>
          <div
            ref={trackRef}
            className="relative pl-[34px] wide:pl-0 wide:pt-[34px]"
          >
            {/* The pencil line runs through the ticks' centres: each 21px
                tick box sits at the track's left edge (stacked) or 2px from
                its top (side by side), so its centre is 10.5px in, or 12.5px
                down. The red pen's 2px line draws over it. */}
            <span
              aria-hidden="true"
              className="absolute left-[10px] top-0 h-full w-px bg-line-strong wide:left-0 wide:right-0 wide:top-[12px] wide:h-px wide:w-auto"
            />
            <span
              aria-hidden="true"
              className="absolute left-[9.5px] top-0 h-[calc(var(--p,0)*100%)] w-[2px] bg-accent wide:left-0 wide:top-[11.5px] wide:h-[2px] wide:w-[calc(var(--p,0)*100%)]"
            />
            <ol className="m-0 grid list-none gap-[22px] p-0 wide:grid-cols-5 wide:gap-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.name}
                  className="relative text-[15px] leading-[1.6] text-muted"
                >
                  {/* A dimension tick: an oblique stroke across the line, inked red once the stage is reached. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-[34px] top-[3px] size-[21px] transition-colors duration-base before:absolute before:left-[2px] before:top-1/2 before:h-[1.5px] before:w-[17px] before:-translate-y-1/2 before:-rotate-45 before:bg-current before:content-[''] motion-reduce:transition-none wide:-top-8 wide:left-0",
                      index < lit
                        ? "text-accent before:h-[2px]"
                        : "text-line-strong",
                    )}
                  />
                  <b className="mb-1 block font-display text-[18px] font-medium leading-[normal] text-ink">
                    {step.name}
                  </b>
                  {step.text}
                </li>
              ))}
            </ol>
            {/* While the lane is pinned, a spark rides the line's head. */}
            {layout ? <span aria-hidden="true" className="build-head" /> : null}
          </div>
          {stacked ? null : bench}
        </section>
      </div>
      {stacked ? bench : null}
    </>
  );
}
