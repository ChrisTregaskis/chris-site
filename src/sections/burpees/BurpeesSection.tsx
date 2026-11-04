import { useReducedMotion } from "framer-motion";
import {
  lazy,
  type LazyExoticComponent,
  Suspense,
  useCallback,
  useRef,
  useState,
} from "react";
import { POSES, setReadout } from "./burpeeSet";
import { BURPEES_VARIANT, type BurpeesVariant } from "./explore/variant";
import { FRAMES } from "./frames";
import { RepBar } from "./RepBar";
import { RepRing } from "./RepRing";
import { useSealBeat } from "./useSealBeat";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { cn } from "@/lib/cn";
import { stickyProgress } from "@/lib/scrollProgress";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { ChapterNumeral } from "@/ui/atoms/ChapterNumeral";
import { Container } from "@/ui/atoms/Container";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { chapterToneStyle } from "@/ui/molecules/chapterTone";
import { ChipList } from "@/ui/molecules/ChipList";
import { BELOW_WIDE } from "@/ui/tokens/breakpoints";

/**
 * Chapter 3: Badass Burpees, Chris's own app. Side by side, the whole stage
 * (copy and phone) sticks while the section scrolls: at the top (b3), or
 * under the sticky bar on short desktops, where the phone also shrinks to
 * fit. Stacked (phones), the copy scrolls by as usual and only the phone
 * sticks, under the bar, sized to the room there, so the paragraph, both
 * links and the whole phone screen fit any phone. The phone counts a set of
 * 100 as you scroll (a ring side by side, the app's progress bar on phones,
 * which leaves the figure room), and its figure (the app's own art) does
 * Navy SEAL burpees at the app's beat. Static under reduced motion: a
 * finished set and one frame.
 */
function BurpeesClassic() {
  const still = useReducedMotion() ?? false;
  const stacked = useMediaQuery(BELOW_WIDE);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState(still ? 100 : 0);
  const stickTop = useRef(0);
  /** What the sticky part travels through: the section side by side, the phone's run stacked. */
  const travel = useRef<HTMLElement | null>(null);
  const { figureRef, pose, count } = useSealBeat(still);

  const onFrame = useCallback((resized: boolean) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const run = runRef.current;
    const pin = pinRef.current;
    if (!section || !stage || !run || !pin) return;
    // Side by side the stage sticks through the section, at the top (b3) or
    // under the bar on short desktops; stacked, the phone sticks through its
    // own run, under the bar. Only a resize can change which, so it's
    // measured only then.
    if (resized || !travel.current) {
      const sideBySide = getComputedStyle(stage).position === "sticky";
      stickTop.current =
        parseFloat(getComputedStyle(sideBySide ? stage : pin).top) || 0;
      travel.current = sideBySide ? section : run;
    }
    const rect = travel.current.getBoundingClientRect();
    setReps(
      Math.round(
        stickyProgress(
          rect.top,
          rect.height,
          window.innerHeight,
          stickTop.current,
        ) * 100,
      ),
    );
  }, []);
  useScrollFrame(onFrame, !still, sectionRef);

  const readout = setReadout((still ? 100 : reps) / 100);

  return (
    <Container>
      <section
        ref={sectionRef}
        id="burpees"
        aria-labelledby="burpees-title"
        style={chapterToneStyle({
          from: "physio",
          to: "burpees",
          feather: "70vh",
        })}
        className={cn("chapter-tone", !still && "wide:h-[220vh]")}
      >
        <div
          ref={stageRef}
          className={cn(
            "grid grid-cols-1 content-center gap-[18px] wide:grid-cols-2 wide:items-center wide:gap-[clamp(24px,5vw,72px)]",
            still
              ? "py-[clamp(40px,6vw,80px)]"
              : "pt-[clamp(40px,6vw,80px)] wide:sticky wide:top-0 wide:h-screen wide:pt-0 [@media(min-width:861px)_and_(max-height:760px)]:top-nav [@media(min-width:861px)_and_(max-height:760px)]:h-[calc(100svh-var(--size-nav))]",
          )}
        >
          <div>
            <ChapterNumeral>3</ChapterNumeral>
            <h2
              id="burpees-title"
              className="m-0 mb-[22px] font-display text-display-lg font-semibold"
            >
              Badass Burpees
            </h2>
            <p className="m-0 mb-4 max-w-measure-narrow text-muted wide:max-w-[31em] wide:text-body-lg">
              A fitness app I built for myself, shared with everyone for free.
              Set the reps and the time you have and it paces you, counting you
              through every one. Its interface is built from atomic components,
              atoms up to molecules and organisms. Keep scrolling to do a set.
            </p>
            <div className="hidden wide:block">
              <ChipList
                items={[
                  "Configurable workouts",
                  "Voice cues",
                  "Custom imagery",
                  "Donations",
                ]}
              />
            </div>
            <p className="m-0 mb-4 mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <ButtonLink
                variant="ghost"
                href="https://badass-burpees.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open badass-burpees.app
                <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
              </ButtonLink>
              <ButtonLink
                variant="ghost"
                href="https://badass-burpees.app/design"
                target="_blank"
                rel="noopener noreferrer"
              >
                See the atomic design system
                <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
              </ButtonLink>
            </p>
          </div>

          {/* Stacked, the phone's run: the phone sticks under the bar while
              this scrolls past (the set's progress); side by side it is just
              the phone's grid cell. */}
          <div ref={runRef} className={cn(!still && "h-[200svh] wide:h-auto")}>
            <div
              ref={pinRef}
              className={cn(
                "grid place-items-center",
                !still &&
                  "sticky top-nav h-[calc(100svh-var(--size-nav))] wide:static wide:h-auto",
              )}
            >
              <div
                role="group"
                aria-label="Badass Burpees app screen"
                className="mx-auto aspect-[9/18.5] w-[min(240px,64vw,calc((100svh_-_var(--size-nav)_-_40px)*9/18.5))] rounded-[38px] bg-bb-bezel p-[10px] shadow-phone wide:w-[min(280px,72vw)] [@media(min-width:861px)_and_(max-height:760px)]:w-[min(280px,72vw,calc((100svh_-_var(--size-nav)_-_24px)*9/18.5))]"
              >
                <div className="flex h-full flex-col items-center justify-between gap-2 rounded-[30px] bg-bb-screen px-4 pb-[18px] pt-[22px] text-center font-display text-bb-ink">
                  <p className="m-0 self-stretch text-left text-[24px] font-extrabold leading-[0.9] tracking-[0.01em]">
                    BADASS
                    <br />
                    BURPEES
                  </p>
                  <div
                    ref={figureRef}
                    role="img"
                    aria-label="The app's figure doing a Navy SEAL burpee, driving one knee forward then the other"
                    className="relative max-h-[200px] min-h-0 flex-auto self-stretch rounded-[14px] bg-[radial-gradient(70%_60%_at_50%_62%,rgb(var(--color-bb-glow))_0,rgb(var(--color-bb-screen))_75%)]"
                  >
                    {POSES.map((name) => (
                      <img
                        key={name}
                        src={FRAMES[name]}
                        alt=""
                        width={512}
                        height={512}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          "pointer-events-none absolute inset-1 size-[calc(100%-8px)] select-none object-contain",
                          name === pose ? "opacity-100" : "opacity-0",
                        )}
                      />
                    ))}
                    <span
                      aria-hidden="true"
                      className="absolute left-[9px] top-2 font-body text-[10px] font-bold leading-[1.6] tracking-[0.08em] text-bb-ink opacity-60"
                    >
                      NAVY SEAL
                    </span>
                    {count ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-2 top-[6px] grid h-6 min-w-6 place-items-center rounded-[6px] bg-bb-yellow text-[14px] font-extrabold text-bb-dark"
                      >
                        {count}
                      </span>
                    ) : null}
                  </div>
                  {stacked ? (
                    <RepBar reps={readout.reps} fill={readout.barFill} />
                  ) : (
                    <RepRing
                      reps={readout.reps}
                      ringOffset={readout.ringOffset}
                    />
                  )}
                  <div className="self-stretch bg-bb-cadence px-[10px] py-[7px] font-body text-[12px] font-semibold leading-[1.6] text-bb-dark">
                    {readout.clock}
                  </div>
                  <div className="self-stretch border-2 border-bb-ink bg-bb-yellow p-[11px] text-[18px] font-extrabold leading-[1.6] text-bb-dark shadow-[4px_4px_0_rgb(var(--color-bb-ink))]">
                    KEEP GOING
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}

/*
 * Design exploration (branch explore/burpees): `?burpees=a|b|c` swaps in a
 * prototype direction, each in its own lazy chunk; no param is the live
 * section above, unchanged.
 */
const DIRECTIONS: Partial<
  Record<BurpeesVariant, LazyExoticComponent<() => JSX.Element>>
> = {
  a: lazy(() =>
    import("./explore/DirectionA").then((m) => ({ default: m.DirectionA })),
  ),
};

export function BurpeesSection() {
  const Direction = BURPEES_VARIANT ? DIRECTIONS[BURPEES_VARIANT] : null;
  if (!Direction) return <BurpeesClassic />;
  return (
    <Suspense fallback={null}>
      <Direction />
    </Suspense>
  );
}
