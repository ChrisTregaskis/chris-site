import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { type Pose, POSES, RING_LENGTH, setReadout } from "./burpeeSet";
import { useSealBeat } from "./useSealBeat";
import chest from "@/assets/burpees/chest.webp";
import fistsToHips from "@/assets/burpees/fists-to-hips.webp";
import plank from "@/assets/burpees/plank.webp";
import plankLKnee from "@/assets/burpees/plank-l-knee.webp";
import plankRKnee from "@/assets/burpees/plank-r-knee.webp";
import stand from "@/assets/burpees/stand.webp";
import tuck from "@/assets/burpees/tuck.webp";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { cn } from "@/lib/cn";
import { stickyProgress } from "@/lib/scrollProgress";
import { ButtonLink } from "@/ui/atoms/ButtonLink";
import { Container } from "@/ui/atoms/Container";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";
import { ChipList } from "@/ui/molecules/ChipList";

const FRAMES: Record<Pose, string> = {
  stand,
  "fists-to-hips": fistsToHips,
  tuck,
  plank,
  chest,
  "plank-r-knee": plankRKnee,
  "plank-l-knee": plankLKnee,
};

/**
 * Chapter 3: Badass Burpees, Chris's own app. The phone sticks while the
 * section scrolls, counting a set of 100 as you go, and its figure (the app's
 * own art) does Navy SEAL burpees at the app's beat. Static under reduced
 * motion: a finished set and one frame.
 */
export function BurpeesSection() {
  const still = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [reps, setReps] = useState(still ? 100 : 0);
  const { figureRef, pose, count } = useSealBeat(still);

  const onFrame = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    setReps(
      Math.round(
        stickyProgress(rect.top, rect.height, window.innerHeight) * 100,
      ),
    );
  }, []);
  useScrollFrame(onFrame, !still);

  const readout = setReadout((still ? 100 : reps) / 100);

  return (
    <Container>
      <section
        ref={sectionRef}
        id="burpees"
        aria-labelledby="burpees-title"
        className={cn("relative", !still && "h-[200vh] wide:h-[220vh]")}
      >
        <div
          className={cn(
            "grid grid-cols-1 content-center gap-[18px] wide:grid-cols-2 wide:items-center wide:gap-[clamp(24px,5vw,72px)]",
            still ? "py-[clamp(40px,6vw,80px)]" : "sticky top-0 h-screen",
          )}
        >
          <div>
            <h2
              id="burpees-title"
              className="m-0 mb-[14px] font-display text-display-lg font-semibold"
            >
              Badass Burpees
            </h2>
            <p className="m-0 mb-4 hidden max-w-measure-narrow text-muted wide:block">
              My own fitness app. Set the reps and the time you have and it
              paces you, counting you through every one. Keep scrolling to do a
              set.
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
            <p className="m-0 mb-4 mt-5">
              <ButtonLink
                variant="ghost"
                href="https://badass-burpees.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open badass-burpees.app
                <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
              </ButtonLink>
            </p>
          </div>

          <div className="mx-auto aspect-[9/18.5] w-[min(220px,60vw)] rounded-[38px] bg-bb-bezel p-[10px] shadow-phone wide:w-[min(280px,72vw)]">
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
              <div className="relative size-[118px]">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    strokeWidth="7"
                    className="stroke-bb-track"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={RING_LENGTH}
                    strokeDashoffset={readout.ringOffset}
                    className="stroke-bb-yellow"
                  />
                </svg>
                <div className="absolute inset-0 grid place-content-center text-[34px] font-extrabold leading-none">
                  <span>{readout.reps}</span>
                  <small className="mt-1 font-body text-[10px] font-semibold tracking-[0.04em] opacity-70">
                    OF 100
                  </small>
                </div>
              </div>
              <div className="self-stretch bg-bb-cadence px-[10px] py-[7px] font-body text-[12px] font-semibold leading-[1.6] text-bb-dark">
                {readout.clock}
              </div>
              <div className="self-stretch border-2 border-bb-ink bg-bb-yellow p-[11px] text-[18px] font-extrabold leading-[1.6] text-bb-dark shadow-[4px_4px_0_rgb(var(--color-bb-ink))]">
                KEEP GOING
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
