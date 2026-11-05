import { type CSSProperties } from "react";
import { COUNT_TYPE, FITTED_COUNT_SIZE, STRAIN_STROKE_EM } from "./countType";
import { SealFigure } from "./SealFigure";

interface SetCountProps {
  reps: number;
  /** Where the count's baseline sits above the bottom of its box, in ems (measured). */
  baseline: number;
  /** Reduced motion: the finished set, and no strain. */
  still: boolean;
}

/**
 * The set's count, huge in the chapter numeral's violet, with the figure
 * doing Navy SEALs in front of it. Its strokes thicken through the last
 * reps (`.set-strain`, on the run's `--set-p`).
 */
export function SetCount({ reps, baseline, still }: SetCountProps) {
  return (
    <div
      data-testid="burpees-count"
      className={`relative col-start-1 row-start-1 ${COUNT_TYPE} ${FITTED_COUNT_SIZE}${still ? "" : " set-strain"}`}
      style={
        still
          ? undefined
          : ({ "--strain-stroke": `${STRAIN_STROKE_EM}em` } as CSSProperties)
      }
    >
      {reps}
      <SealFigure baseline={baseline} still={still} />
    </div>
  );
}
