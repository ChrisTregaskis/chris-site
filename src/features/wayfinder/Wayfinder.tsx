import { useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { ChatMock } from "./ChatMock";
import { StepCard } from "./StepCard";
import { useWayfinderDemo } from "./useWayfinderDemo";
import { WayfinderFigure } from "./WayfinderFigure";
import {
  DEMO_STEP,
  PART_ORDER,
  PARTS,
  PICKER_OPTIONS,
  PLATFORM_INDEXES,
  PLATFORMS,
  type PartId,
  partForStep,
  stepForPart,
} from "./parts";
import { useStepSync } from "@/hooks/useStepSync";
import { cn } from "@/lib/cn";
import { focusLine } from "@/lib/stepSync";
import { topClearance } from "@/lib/topClearance";
import { Button } from "@/ui/atoms/Button";
import { NumberedDropdown, pad2 } from "@/ui/organisms/NumberedDropdown";
import { Odometer } from "@/ui/organisms/Odometer";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

const CHAT_BUBBLE = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M2 3h12v8H7l-3 3v-3H2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const optionText = (n: number) => `${pad2(n)} ${PICKER_OPTIONS[n - 1].label}`;

/**
 * Wayfinder, part by part: the isometric figure pins while a card for each
 * part scrolls past, and scrolling, clicking the figure, a card or the picker
 * all select the same part. The last card is a live (scripted) chat whose
 * messages travel the figure.
 */
export function Wayfinder() {
  const reducedMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const stacked = window.matchMedia(BELOW_WIDE).matches;
    if (!stacked || !stage) {
      return focusLine(window.innerHeight, null, topClearance());
    }
    // Stacked, the stage pins under the top bar: its bottom is where the room for cards starts.
    const pinnedTop = parseFloat(getComputedStyle(stage).top) || 0;
    return focusLine(window.innerHeight, pinnedTop + stage.offsetHeight);
  }, []);

  const { current, stepRef, cardRef, goTo } = useStepSync({
    measure,
    reducedMotion,
  });
  const demo = useWayfinderDemo(reducedMotion);
  const selected = partForStep(current);
  const shown = current || 1;

  const selectPart = (id: PartId) => goTo(stepForPart(id));

  const announcement = selected
    ? `Part ${current}, ${PARTS[selected].name}`
    : current === DEMO_STEP
      ? "Live demo"
      : "";

  return (
    <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
      <div
        ref={stageRef}
        className="sticky top-nav z-[3] block bg-gradient-to-b from-surface from-90% to-surface/0 pb-[18px] pt-[10px] wide:top-[6vh] wide:flex wide:h-[88vh] wide:flex-col wide:items-center wide:justify-center wide:gap-[14px] wide:bg-none wide:p-0"
      >
        <div className="flex w-full flex-col items-stretch gap-[14px]">
          <WayfinderFigure
            selected={selected}
            hot={demo.hot}
            lit={demo.lit}
            platform={demo.platform}
            onPart={selectPart}
            onSlot={demo.swapPlatform}
            pulseRef={demo.pulseRef}
          />
          <div className="flex w-full items-stretch justify-center gap-[10px]">
            <NumberedDropdown
              label="Wayfinder part"
              options={PICKER_OPTIONS}
              value={current}
              valueText={optionText(shown)}
              onSelect={(n) => goTo(n)}
            >
              <Odometer
                value={shown}
                reducedMotion={reducedMotion}
                className="h-8 min-w-0 flex-1 wide:h-[34px]"
                renderItem={(n) => (
                  <>
                    <span
                      className={cn(
                        "inline-grid h-8 min-w-8 flex-none place-items-center rounded-row px-[6px] font-display text-[15px] font-bold tabular-nums tracking-[0.02em] wide:h-[34px] wide:min-w-[34px]",
                        current
                          ? "bg-accent text-on-accent"
                          : "bg-raised text-ink",
                      )}
                    >
                      {pad2(n)}
                    </span>
                    <span className="overflow-hidden text-ellipsis">
                      {PICKER_OPTIONS[n - 1].label}
                    </span>
                  </>
                )}
              />
            </NumberedDropdown>
            <Button
              pressed={current === DEMO_STEP}
              onClick={() => goTo(DEMO_STEP)}
              className="flex-none rounded-control px-4 py-0 wide:px-5"
            >
              Try it
            </Button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div className="relative z-[1] pb-[34vh] pt-[4vh] wide:py-[30vh]">
        {PART_ORDER.map((id, index) => {
          const n = index + 1;
          const part = PARTS[id];
          const stack =
            id === "ai"
              ? PLATFORMS.map(
                  (name, platform) =>
                    `Platform ${name}${platform === demo.platform ? " (live)" : ""}`,
                )
              : part.stack;
          return (
            <StepCard
              key={id}
              n={n}
              kicker={part.name}
              heading={part.heading}
              text={part.text}
              stack={stack}
              on={current === n}
              badgeLabel={`Show part ${n}, ${part.name}`}
              onSelect={goTo}
              stepRef={stepRef(n)}
              cardRef={cardRef(n)}
            >
              {id === "ai" ? (
                <div
                  role="group"
                  aria-label="AI platform"
                  data-no-select=""
                  className="mt-3 flex gap-[6px]"
                >
                  {PLATFORM_INDEXES.map((platform) => {
                    const live = platform === demo.platform;
                    return (
                      <button
                        key={platform}
                        type="button"
                        aria-pressed={live}
                        onClick={() => demo.swapPlatform(platform)}
                        className={cn(
                          "cursor-pointer rounded-pill border-[1.5px] px-3 py-[5px] text-[13px] font-semibold leading-[normal] transition-colors duration-base motion-reduce:transition-none",
                          live
                            ? "border-accent bg-accent text-on-accent"
                            : "border-line bg-transparent text-ink",
                        )}
                      >
                        {PLATFORMS[platform]}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </StepCard>
          );
        })}
        <StepCard
          n={DEMO_STEP}
          kicker="Try it"
          heading="Now send it a message"
          text="Pick a question and watch it travel the real route through the figure. The replies are scripted."
          on={current === DEMO_STEP}
          demo
          badge={CHAT_BUBBLE}
          badgeLabel="Show the live demo"
          onSelect={goTo}
          stepRef={stepRef(DEMO_STEP)}
          cardRef={cardRef(DEMO_STEP)}
        >
          <ChatMock
            messages={demo.messages}
            typing={demo.typing}
            trace={demo.trace}
            onSend={(question) => {
              void demo.send(question);
            }}
          />
        </StepCard>
      </div>
    </div>
  );
}
