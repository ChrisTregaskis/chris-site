import { COUNT_TYPE, FITTED_COUNT_SIZE } from "./countType";
import { SealFigure } from "./SealFigure";

interface SetCountProps {
  reps: number;
  /** Where the count's baseline sits above the bottom of its box, in ems (measured). */
  baseline: number;
  still: boolean;
}

/** The set's count, huge in the chapter numeral's violet, with the figure doing Navy SEALs in front of it. */
export function SetCount({ reps, baseline, still }: SetCountProps) {
  return (
    <div
      data-testid="burpees-count"
      className={`relative col-start-1 row-start-1 ${COUNT_TYPE} ${FITTED_COUNT_SIZE}`}
    >
      {reps}
      <SealFigure baseline={baseline} still={still} />
    </div>
  );
}
