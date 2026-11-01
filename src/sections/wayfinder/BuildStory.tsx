import { useReducedMotion } from "framer-motion";
import { useBuildRunway } from "./useBuildRunway";
import { cn } from "@/lib/cn";
import { milestoneAt } from "@/lib/scrollProgress";

const STEPS = [
  { name: "Spec", text: "What it must do, written before code." },
  { name: "Plan", text: "Small tasks with clear finish lines." },
  { name: "Agents build", text: "AI agents implement, in parallel." },
  { name: "Review gates", text: "Tests, types, lint and my own read." },
  { name: "Ship", text: "Deployed from CI, infrastructure as code." },
] as const;

/** The step the eval bench branches off (Agents build). */
const FORK_STEP = 2;
/** The branch plays out from that step lighting until just before the next one does. */
const FORK = {
  from: milestoneAt(FORK_STEP, STEPS.length),
  to: milestoneAt(FORK_STEP + 1, STEPS.length) - 0.04,
};

const BENCH = {
  name: "Eval bench",
  text: "Free text means endless possible conversations. Before each release the bench replays as many as is sensible, not every edge case, and catches answers that got worse before they ship.",
};

function Dot({ on, className }: { on: boolean; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute size-[21px] rounded-pill border-[3px] transition-colors duration-base motion-reduce:transition-none",
        on ? "border-signal bg-signal" : "border-line bg-surface",
        className,
      )}
    />
  );
}

/** A 3px line in the lane's style: a quiet base with the gradient fill over it. */
function Line({ className, fill }: { className: string; fill: string }) {
  return (
    <span aria-hidden="true" className={cn("absolute", className)}>
      <span className="absolute inset-0 rounded-[3px] bg-line" />
      <span className={cn("absolute left-0 top-0 rounded-[3px]", fill)} />
    </span>
  );
}

/**
 * The eval bench, branching off Agents build. Stacked, it hangs under the
 * step, joined to the lane by a short line that fills left to right; side by
 * side, it sits in a second row under the last three steps, and the branch
 * drops from the lane in the gutter beside the Agents build dot.
 */
function Bench({ on }: { on: boolean }) {
  return (
    <div className="relative mt-[14px] pl-[30px] wide:mt-0 wide:w-[calc(300%+32px)] wide:pl-4">
      {/* Stacked: from the lane (6px into the track's 34px inset) to the dot. */}
      <Line
        className="left-[-27px] top-3 h-[3px] w-[27px] wide:hidden"
        fill="h-full w-[calc(var(--f,0)*100%)] bg-gradient-to-r from-accent to-signal"
      />
      <Dot on={on} className="left-0 top-[3px] wide:left-[-18.5px]" />
      <b className="mb-[2px] block font-display text-[18px] font-semibold leading-[normal] text-ink">
        {BENCH.name}
      </b>
      {BENCH.text}
    </div>
  );
}

/** How Wayfinder was built: five stages lit one by one as the section is scrolled through, with the eval bench branching off Agents build. */
export function BuildStory() {
  const still = useReducedMotion() ?? false;
  const { runRef, sectionRef, trackRef, layout, lit, forked } = useBuildRunway(
    STEPS.length,
    still,
    FORK,
  );

  return (
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
          {/* Side by side, every step spans two subgrid rows so the bench's row sits under all of them. */}
          <ol className="m-0 grid list-none gap-[22px] p-0 wide:grid-cols-5 wide:grid-rows-[auto_auto] wide:gap-x-4 wide:gap-y-6">
            {STEPS.map((step, index) => (
              <li
                key={step.name}
                className="relative text-[15px] leading-[1.6] text-muted wide:row-span-2 wide:grid wide:grid-rows-subgrid"
              >
                <div className="relative">
                  <Dot
                    on={index < lit}
                    className="-left-[34px] top-[3px] wide:-top-8 wide:left-0"
                  />
                  {index === FORK_STEP ? (
                    // Side by side: the branch, from the lane (26px above) down the gutter to the bench's dot (the 24px row gap plus 13.5px below).
                    <Line
                      className="-bottom-[37.5px] -left-[9.5px] -top-[26px] hidden w-[3px] wide:block"
                      fill="w-full h-[calc(var(--f,0)*100%)] bg-gradient-to-b from-accent to-signal"
                    />
                  ) : null}
                  <b className="mb-[2px] block font-display text-[18px] font-semibold leading-[normal] text-ink">
                    {step.name}
                  </b>
                  {step.text}
                </div>
                {index === FORK_STEP ? <Bench on={forked} /> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
