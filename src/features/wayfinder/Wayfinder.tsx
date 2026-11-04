import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMock } from "./ChatMock";
import { StepCard } from "./StepCard";
import { useWayfinder3D } from "./useWayfinder3D";
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
import { DURATION } from "@/ui/tokens/motion";

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

  // PROTOTYPE: the parts' steps show the figure taken apart; the demo needs
  // it whole. The toggle overrides that until the step changes.
  const [override, setOverride] = useState<{
    step: number;
    exploded: boolean;
  } | null>(null);
  // Above the first card (scrolling back up), the board is whole again.
  const startRef = useRef<HTMLDivElement>(null);
  const [beforeStory, setBeforeStory] = useState(true);
  useEffect(() => {
    const start = startRef.current;
    if (!start) return undefined;
    // Intersecting means "above the line 55% down the screen", however far
    // above: a huge top margin, so even an instant jump crosses it.
    const observer = new IntersectionObserver(
      ([entry]) => setBeforeStory(!entry.isIntersecting),
      { rootMargin: "100000px 0px -45% 0px" },
    );
    observer.observe(start);
    return () => observer.disconnect();
  }, []);
  const storyExploded = selected !== null && !beforeStory;
  const exploded =
    override && override.step === current ? override.exploded : storyExploded;
  const hostRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const figure3d = useWayfinder3D({
    stageRef,
    hostRef,
    figureRef,
    state: {
      selected,
      exploded,
      hot: demo.hot,
      lit: demo.lit,
      platform: demo.platform,
    },
    reducedMotion,
    onPart: selectPart,
    onSlot: demo.swapPlatform,
  });
  const in3d = figure3d.status === "ready";
  const { pulseListener } = demo;
  const { pulse } = figure3d;
  useEffect(() => {
    pulseListener.current = in3d ? pulse : null;
  });
  const sendDemo = (
    question: string,
    ask?: Parameters<typeof demo.send>[1],
  ) => {
    if (in3d && exploded) {
      // Put it back together first; the message travels the whole board.
      setOverride({ step: current, exploded: false });
      window.setTimeout(
        () => void demo.send(question, ask),
        reducedMotion ? 0 : (DURATION.slow + 0.5) * 1000,
      );
      return;
    }
    void demo.send(question, ask);
  };
  // Stacked, the demo card is taller than the room under the figure: bring
  // its bottom (the chat input) into view rather than its top.
  const select = (n: number) =>
    goTo(
      n,
      n === DEMO_STEP && window.matchMedia(BELOW_WIDE).matches
        ? { align: "end" }
        : undefined,
    );

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
        {/* PROTOTYPE: the 3D figure's canvas and labels, over the SVG's box. */}
        <div
          ref={hostRef}
          className={cn(
            "absolute inset-0 transition-opacity duration-slow motion-reduce:transition-none",
            in3d ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
        <div
          className={cn(
            "relative z-[1] flex w-full flex-col items-stretch gap-[14px]",
            in3d && "pointer-events-none",
          )}
        >
          <div
            ref={figureRef}
            className={cn(
              "transition-opacity duration-slow motion-reduce:transition-none",
              in3d && "opacity-0",
            )}
          >
            <WayfinderFigure
              selected={selected}
              hot={demo.hot}
              lit={demo.lit}
              platform={demo.platform}
              onPart={selectPart}
              onSlot={demo.swapPlatform}
              pulseRef={demo.pulseRef}
            />
          </div>
          <div className="pointer-events-auto relative flex w-full items-stretch justify-center gap-[10px]">
            <NumberedDropdown
              label="Wayfinder part"
              options={PICKER_OPTIONS}
              value={current}
              valueText={optionText(shown)}
              onSelect={select}
            >
              <Odometer
                value={shown}
                reducedMotion={reducedMotion}
                className="h-8 min-w-0 flex-1 wide:h-[34px]"
                renderItem={(n) => (
                  <>
                    <span className="inline-grid h-8 flex-none place-items-center font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-accent wide:h-[34px]">
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
              onClick={() => select(DEMO_STEP)}
              className="flex-none rounded-control px-4 py-0 wide:px-5"
            >
              Try it
            </Button>
            {in3d ? (
              <div className="absolute left-0 right-0 top-full mt-4 flex items-baseline justify-center gap-5 text-[13px]">
                <Button
                  variant="ghost"
                  size="sm"
                  pressed={exploded}
                  onClick={() =>
                    setOverride({ step: current, exploded: !exploded })
                  }
                >
                  {exploded ? "Put it back" : "Take it apart"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={figure3d.resetView}
                  className={cn(!figure3d.rotated && "invisible")}
                >
                  Reset view
                </Button>
                <span className="text-muted" aria-hidden="true">
                  Drag to turn it, click a part
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div className="relative z-[1] pb-[34vh] pt-[4vh] wide:py-[30vh]">
        <div ref={startRef} aria-hidden="true" />
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
                  className="mt-3 flex gap-3"
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
                          // The live platform: lilac on a solid underline; the
                          // others on a dotted one, so they still read as choices.
                          "cursor-pointer border-0 bg-transparent px-[2px] py-[5px] text-[13px] font-semibold leading-[normal] underline decoration-[1.5px] underline-offset-[6px] transition-colors duration-base hover:text-ink motion-reduce:transition-none",
                          live
                            ? "text-accent decoration-accent decoration-solid"
                            : "text-muted decoration-line-field decoration-dotted",
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
          onSelect={select}
          stepRef={stepRef(DEMO_STEP)}
          cardRef={cardRef(DEMO_STEP)}
        >
          <ChatMock
            messages={demo.messages}
            typing={demo.typing}
            trace={demo.trace}
            onSend={sendDemo}
          />
        </StepCard>
      </div>
    </div>
  );
}
