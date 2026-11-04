import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { ChatMock } from "./ChatMock";
import { type Ask } from "./demo";
import { INSIDE } from "./explode";
import { InsideList } from "./InsideList";
import { StepCard } from "./StepCard";
import { useWayfinderDemo } from "./useWayfinderDemo";
import { type ExplodeControls, WayfinderFigure } from "./WayfinderFigure";
import {
  DEMO_STEP,
  INTRO,
  INTRO_STEP,
  PART_ORDER,
  PARTS,
  PICKER_OPTIONS,
  PLATFORM_INDEXES,
  PLATFORMS,
  type PartId,
  partForStep,
  partNumber,
  stepForPart,
} from "./parts";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

/** Taken apart: layers lifting off one another (the intro's badge and the toggle's). */
const APART_GLYPH = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M8 1.6 14 4.4 8 7.2 2 4.4z M2 8.2 8 11 14 8.2 M2 11.6 8 14.4 14 11.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const option = (step: number) => PICKER_OPTIONS[step - 1];
const optionText = (step: number) =>
  `${pad2(option(step).numeral)} ${option(step).label}`;

/** A press of the toggle (or the demo putting it back), for one step only. */
interface Override {
  step: number;
  apart: boolean;
  /** Back together quickly: a message is waiting to travel. */
  quick?: boolean;
}

/**
 * Wayfinder, part by part: the isometric figure pins while a card for each
 * step scrolls past, and scrolling, clicking the figure, a card or the picker
 * all select the same step. The first step takes the figure apart; each part
 * then opens into its numbered pieces (listed on its card); the last step, a
 * live (scripted) chat, puts it back together and sends messages round it.
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
  const stacked = useMediaQuery(BELOW_WIDE);
  const selected = partForStep(current);
  const shown = current || INTRO_STEP;

  const selectPart = (id: PartId) => goTo(stepForPart(id));
  // Stacked, the demo card is taller than the room under the figure: bring
  // its bottom (the chat input) into view rather than its top.
  const select = (n: number) =>
    goTo(
      n,
      n === DEMO_STEP && window.matchMedia(BELOW_WIDE).matches
        ? { align: "end" }
        : undefined,
    );

  // Taken apart from the intro to the last part, whole for the demo (and
  // above the story). The toggle overrides that until the step changes.
  const [override, setOverride] = useState<Override | null>(null);
  const own = override?.step === current ? override : null;
  const apart = own ? own.apart : current >= INTRO_STEP && current < DEMO_STEP;
  const toggleApart = () => setOverride({ step: current, apart: !apart });

  const explode = useRef<ExplodeControls | null>(null);
  const send = (question: string, ask?: Ask) => {
    // The demo runs on the whole board. Taken apart, it goes back together
    // quickly while the message shows at once, and sets off when it's whole.
    let ready: Promise<void> | undefined;
    if (apart) {
      setOverride({ step: current, apart: false, quick: true });
      ready = explode.current?.whenAssembled();
    }
    void demo.send(question, ask, ready);
  };

  // A piece picked out from an "Inside" list: pressed (kept until the step
  // changes) or previewed while pointed at or focused.
  const [pressed, setPressed] = useState<{ step: number; id: string } | null>(
    null,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const pressedId = pressed?.step === current ? pressed.id : null;
  const press = (step: number, id: string) => {
    if (step !== current) goTo(step);
    setPressed(pressedId === id && step === current ? null : { step, id });
  };

  const announcement =
    own && !own.quick
      ? own.apart
        ? "Taken apart"
        : "Back together"
      : selected
        ? `Part ${partNumber(selected)}, ${PARTS[selected].name}`
        : current === INTRO_STEP
          ? "Taken apart, part by part"
          : current === DEMO_STEP
            ? "Live demo"
            : "";

  return (
    <div className="relative wide:grid wide:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] wide:gap-[clamp(24px,5vw,72px)]">
      <div
        ref={stageRef}
        className="sticky top-nav z-[3] block bg-gradient-to-b from-surface from-90% to-surface/0 pb-[18px] pt-[10px] wide:top-[6vh] wide:flex wide:h-[88vh] wide:flex-col wide:items-center wide:justify-center wide:gap-[14px] wide:bg-none wide:p-0"
      >
        {/* Wide, it sits a little low in the stage: taken apart, the figure
            grows up into the room above (see zoom.ts). */}
        <div className="flex w-full flex-col items-stretch gap-[14px] wide:pt-[12vh]">
          <WayfinderFigure
            selected={selected}
            hot={demo.hot}
            lit={demo.lit}
            platform={demo.platform}
            onPart={selectPart}
            onSlot={demo.swapPlatform}
            pulseRef={demo.pulseRef}
            apart={apart}
            lite={stacked}
            quick={own?.quick ?? false}
            highlight={preview ?? pressedId}
            reducedMotion={reducedMotion}
            stageRef={stageRef}
            onExplode={(controls) => {
              explode.current = controls;
            }}
          />
          <div className="flex w-full items-stretch justify-center gap-[10px]">
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
                      {pad2(option(n).numeral)}
                    </span>
                    <span className="overflow-hidden text-ellipsis">
                      {option(n).label}
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
          </div>
          {stacked ? null : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={toggleApart}
                className="gap-2 text-[14px] [&>svg]:size-4 [&>svg]:text-accent"
              >
                {APART_GLYPH}
                {apart ? "Put it back together" : "Take it apart"}
              </Button>
            </div>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div className="relative z-[1] pb-[34vh] pt-[4vh] wide:py-[30vh]">
        <StepCard
          n={INTRO_STEP}
          kicker={INTRO.name}
          heading={INTRO.heading}
          text={INTRO.text}
          on={current === INTRO_STEP}
          badge={APART_GLYPH}
          badgeLabel="Show the board taken apart"
          onSelect={goTo}
          stepRef={stepRef(INTRO_STEP)}
          cardRef={cardRef(INTRO_STEP)}
        />
        {PART_ORDER.map((id) => {
          const n = partNumber(id);
          const step = stepForPart(id);
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
              n={step}
              kicker={part.name}
              heading={part.heading}
              text={part.text}
              stack={stack}
              on={current === step}
              badge={n}
              badgeLabel={`Show part ${n}, ${part.name}`}
              onSelect={goTo}
              stepRef={stepRef(step)}
              cardRef={cardRef(step)}
            >
              <InsideList
                n={n}
                pieces={INSIDE[id]}
                pressed={pressed?.step === step ? pressed.id : null}
                onPreview={setPreview}
                onPress={(piece) => press(step, piece)}
              />
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
            onSend={send}
          />
        </StepCard>
      </div>
    </div>
  );
}
