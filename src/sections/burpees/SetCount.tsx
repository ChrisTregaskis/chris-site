import { type CSSProperties } from "react";
import { COUNT_TYPE, FITTED_COUNT_SIZE, STRAIN_STROKE_EM } from "./countType";
import { SealFigure } from "./SealFigure";

interface SetCountProps {
  reps: number;
  /** Where the count's baseline sits above the bottom of its box, in ems (measured). */
  baseline: number;
  still: boolean;
  /** Prototype c: the strokes thicken through the last reps (`.set-strain`). */
  strain?: boolean;
}

/** The set's count, huge in the chapter numeral's violet, with the figure doing Navy SEALs in front of it. */
export function SetCount({
  reps,
  baseline,
  still,
  strain = false,
}: SetCountProps) {
  return (
    <div
      data-testid="burpees-count"
      className={`relative col-start-1 row-start-1 ${COUNT_TYPE} ${FITTED_COUNT_SIZE}${strain ? " set-strain" : ""}`}
      style={
        strain
          ? ({ "--strain-stroke": `${STRAIN_STROKE_EM}em` } as CSSProperties)
          : undefined
      }
    >
      {reps}
      <SealFigure baseline={baseline} still={still} />
    </div>
  );
}
