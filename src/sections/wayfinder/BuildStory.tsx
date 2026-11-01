import { useReducedMotion } from "framer-motion";
import { useBuildRunway } from "./useBuildRunway";
import { cn } from "@/lib/cn";

const STEPS = [
  { name: "Spec", text: "What it must do, written before code." },
  { name: "Plan", text: "Small tasks with clear finish lines." },
  { name: "Agents build", text: "AI agents implement, in parallel." },
  { name: "Review gates", text: "Tests, types, lint and my own read." },
  { name: "Ship", text: "Deployed from CI, infrastructure as code." },
] as const;

/** How Wayfinder was built: five stages lit one by one as the section is scrolled through. */
export function BuildStory() {
  const still = useReducedMotion() ?? false;
  const { runRef, sectionRef, trackRef, layout, lit } = useBuildRunway(
    STEPS.length,
    still,
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
          className="m-0 mb-[6px] font-display text-title-lg font-semibold"
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
                    "absolute -left-[34px] top-[3px] size-[15px] rounded-pill border-[3px] transition-colors duration-base motion-reduce:transition-none wide:-top-8 wide:left-0",
                    index < lit
                      ? "border-signal bg-signal"
                      : "border-line bg-surface",
                  )}
                />
                <b className="mb-[2px] block font-display text-[18px] font-semibold text-ink">
                  {step.name}
                </b>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
