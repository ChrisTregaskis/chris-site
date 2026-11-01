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
 * side it sits in the pinned section, centred under the plan, build and review steps;
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
        className="flex max-w-[640px] flex-col gap-3 rounded-card sheet:flex-row sheet:gap-4 border border-dashed border-line-strong bg-panel px-5 py-4 wide:col-span-3 wide:col-start-2"
      >
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-pill bg-raised text-signal"
        >
          <svg viewBox="0 0 24 24" className="size-5">
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
            className="m-0 mb-[2px] font-display text-[18px] font-semibold leading-[normal] text-ink"
          >
            {BENCH.name}
          </h4>
          <p className="m-0">{BENCH.text}</p>
        </div>
      </motion.aside>
    </div>
  );
}

/** How Wayfinder was built: five stages lit one by one as the section is scrolled through, with the eval bench as a note beneath. */
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
      <div
        ref={runRef}
        className="relative"
        style={layout ? { height: layout.height } : undefined}
      >
        <section
          ref={sectionRef}
          aria-labelledby="build-title"
          className={cn("py-[clamp(40px,6vw,80px)]", layout && "sticky")}
          style={layout ? { top: layout.pinTop } : undefined}
        >
          <h3
            id="build-title"
            className="m-0 mb-[6px] font-display text-title-lg font-semibold leading-[normal]"
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
            <span
              aria-hidden="true"
              className="absolute left-[6px] top-0 h-full w-[3px] rounded-[3px] bg-line wide:left-0 wide:right-0 wide:top-2 wide:h-[3px] wide:w-auto"
            />
            <span
              aria-hidden="true"
              className="absolute left-[6px] top-0 h-[calc(var(--p,0)*100%)] w-[3px] rounded-[3px] bg-gradient-to-b from-accent to-signal wide:left-0 wide:top-2 wide:h-[3px] wide:w-[calc(var(--p,0)*100%)] wide:bg-gradient-to-r"
            />
            <ol className="m-0 grid list-none gap-[22px] p-0 wide:grid-cols-5 wide:gap-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.name}
                  className="relative text-[15px] leading-[1.6] text-muted"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-[34px] top-[3px] size-[21px] rounded-pill border-[3px] transition-colors duration-base motion-reduce:transition-none wide:-top-8 wide:left-0",
                      index < lit
                        ? "border-signal bg-signal"
                        : "border-line bg-surface",
                    )}
                  />
                  <b className="mb-[2px] block font-display text-[18px] font-semibold leading-[normal] text-ink">
                    {step.name}
                  </b>
                  {step.text}
                </li>
              ))}
            </ol>
          </div>
          {stacked ? null : bench}
        </section>
      </div>
      {stacked ? bench : null}
    </>
  );
}
