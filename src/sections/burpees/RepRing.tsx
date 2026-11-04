import { REPS, RING_LENGTH } from "./burpeeSet";
import { VisuallyHidden } from "@/ui/atoms/VisuallyHidden";

interface RepRingProps {
  reps: number;
  /** The ring's stroke offset: its full length at no reps, 0 at a finished set. */
  ringOffset: number;
}

/** The phone mock's rep counter side by side: the app's round progress ring with the count inside. */
export function RepRing({ reps, ringOffset }: RepRingProps) {
  return (
    <div className="relative size-[118px]">
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="size-full -rotate-90"
      >
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
          strokeDashoffset={ringOffset}
          className="stroke-bb-yellow"
        />
      </svg>
      <VisuallyHidden>
        {reps} of {REPS} burpees done
      </VisuallyHidden>
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-content-center text-[34px] font-extrabold leading-none"
      >
        <span>{reps}</span>
        <small className="mt-1 font-body text-[10px] font-semibold tracking-[0.04em] opacity-70">
          OF {REPS}
        </small>
      </div>
    </div>
  );
}
