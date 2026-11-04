import { type RefObject } from "react";
import { COUNT_SIZE, COUNT_TYPE } from "./countType";
import { FULL_DIGITS } from "./stageLayout";

interface CountRulerProps {
  rulerRef: RefObject<HTMLSpanElement>;
  /** A zero-size box on the ruler's baseline. */
  baselineRef: RefObject<HTMLSpanElement>;
}

/**
 * A finished set's count in the count's type at its screen-driven size,
 * never drawn: the stage measures it to learn how wide this browser draws
 * the digits and where their baseline falls. Clipped to nothing, so however
 * wide it runs it never widens the page.
 */
export function CountRuler({ rulerRef, baselineRef }: CountRulerProps) {
  return (
    <span className="pointer-events-none invisible absolute left-0 top-0 size-0 overflow-hidden">
      <span
        ref={rulerRef}
        className={`inline-block ${COUNT_TYPE} ${COUNT_SIZE}`}
      >
        {"0".repeat(FULL_DIGITS)}
        <span ref={baselineRef} className="inline-block size-0" />
      </span>
    </span>
  );
}
