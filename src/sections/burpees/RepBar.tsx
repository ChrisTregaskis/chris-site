import { REPS } from "./burpeeSet";

interface RepBarProps {
  reps: number;
  /** How much of the bar is filled, 0 to 1. */
  fill: number;
}

/**
 * The phone mock's rep counter on phones: the count on one line over a
 * horizontal bar, after the app's own progress bar (a bone-edged track with
 * a yellow fill), so the figure keeps its room on a small screen. A
 * progressbar to assistive tech, saying what the ring says side by side.
 */
export function RepBar({ reps, fill }: RepBarProps) {
  return (
    <div className="self-stretch text-left">
      <p
        aria-hidden="true"
        className="m-0 flex items-baseline gap-[6px] text-[30px] font-extrabold leading-none"
      >
        <span>{reps}</span>
        <small className="font-body text-[10px] font-semibold tracking-[0.04em] opacity-70">
          OF {REPS}
        </small>
      </p>
      <div
        role="progressbar"
        aria-label="Burpees done"
        aria-valuemin={0}
        aria-valuemax={REPS}
        aria-valuenow={reps}
        aria-valuetext={`${reps} of ${REPS} burpees done`}
        className="mt-[6px] h-3 border-2 border-bb-ink bg-bb-glow"
      >
        <div
          className="h-full origin-left bg-bb-yellow"
          style={{ transform: `scaleX(${fill})` }}
        />
      </div>
    </div>
  );
}
