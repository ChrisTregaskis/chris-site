interface SentenceStepperProps {
  value: number;
  /** What the number counts, for the buttons' names ("reps", "minutes"). */
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/**
 * A number set inside a sentence with a quiet minus and plus either side,
 * after the app's steppers (big targets, a fixed step).
 */
export function SentenceStepper({
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: SentenceStepperProps) {
  const button =
    "grid size-9 place-items-center rounded-pill bg-transparent font-body text-[22px] font-normal leading-none text-accent transition-colors duration-fast hover:bg-raised disabled:text-line-strong disabled:hover:bg-transparent motion-reduce:transition-none";
  return (
    <span className="inline-flex items-baseline gap-1 align-baseline">
      <button
        type="button"
        className={`${button} self-center`}
        aria-label={`${step} fewer ${unit}`}
        disabled={value - step < min}
        onClick={() => onChange(value - step)}
      >
        −
      </button>
      <span className="min-w-[2ch] text-center tabular-nums">{value}</span>
      <button
        type="button"
        className={`${button} self-center`}
        aria-label={`${step} more ${unit}`}
        disabled={value + step > max}
        onClick={() => onChange(value + step)}
      >
        +
      </button>
    </span>
  );
}
