import { type RefObject, useEffect, useRef } from "react";
import { FRAMES } from "../frames";
import { applyView } from "./applyView";
import {
  type BurpeeId,
  clock,
  focusRep,
  type PacingShape,
  seconds,
  type View,
} from "./pacing";
import { NAVY_SEAL, SIX_COUNT } from "./plateCells";

interface RibbonProps {
  shape: PacingShape;
  burpee: BurpeeId;
  /** The parent drives the view through this (while scrolling)… */
  rootRef?: RefObject<HTMLDivElement>;
  /** …or the ribbon holds one view of its own (the static scales). */
  fixed?: { view: View; level: number };
}

/**
 * The whole session as one bar: every rep's slot laid end to end, its work
 * in the app's flame, rest in its violet and the count-in in its yellow.
 * Over it, what each zoom level can show: the rep the zoom goes into; that
 * rep's slot named part by part with the count-in's seconds; and the rep's
 * own beats, each with the drawing for its position and the count under it.
 */
export function Ribbon({ shape, burpee, rootRef, fixed }: RibbonProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = rootRef ?? ownRef;
  const cells = burpee === "navy-seal" ? NAVY_SEAL : SIX_COUNT;
  const focus = focusRep(shape.reps) * shape.intervalMs;
  const restAt = focus + shape.repMs;
  const countAt = restAt + shape.restMs;
  const beatAt = (index: number) =>
    focus + (index === 0 ? 0 : shape.setBeatMs + (index - 1) * 800);
  const beatLength = (index: number) => (index === 0 ? shape.setBeatMs : 800);

  useEffect(() => {
    const root = ref.current;
    if (!fixed || !root) return undefined;
    const apply = () => applyView(root, fixed.view, fixed.level);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [fixed, ref, shape]);

  const slots = Array.from({ length: shape.reps }, (_, rep) => rep);
  const place = "absolute left-0 top-0 will-change-transform";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative w-full select-none overflow-hidden"
    >
      {/* The rep's drawings, one per beat. */}
      <div className="relative h-[clamp(64px,12vh,132px)]">
        {cells.map((cell, index) => (
          <div
            key={cell.key}
            data-t={beatAt(index)}
            data-d={beatLength(index)}
            data-show="2"
            className={`${place} h-full px-[2px]`}
          >
            <img
              src={FRAMES[cell.pose]}
              alt=""
              width={512}
              height={512}
              decoding="async"
              className="size-full object-contain object-bottom"
            />
          </div>
        ))}
      </div>
      {/* The count-in's seconds, and the rep the zoom is heading for. */}
      <div className="relative h-7 font-display text-[18px] font-semibold tabular-nums leading-7">
        {shape.countInMs > 0
          ? Array.from({ length: shape.countInMs / 1000 }, (_, k) => (
              <span
                key={k}
                data-t={countAt + k * 1000}
                data-d={1000}
                data-show="1"
                className={`${place} text-center text-bb-yellow`}
              >
                {shape.countInMs / 1000 - k}
              </span>
            ))
          : null}
        <span
          data-t={focus}
          data-show="0"
          className={`${place} whitespace-nowrap border-l-2 border-ink pl-2 font-body text-caption font-normal leading-7 text-ink`}
        >
          rep {focusRep(shape.reps) + 1}
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${shape.totalMs} 1`}
          preserveAspectRatio="none"
          className="block h-[clamp(36px,6vh,56px)] w-full"
        >
          {slots.map((rep) => {
            const at = rep * shape.intervalMs;
            const last = rep === shape.reps - 1;
            return (
              <g key={rep}>
                <rect
                  x={at}
                  y={0}
                  width={shape.repMs}
                  height={1}
                  className="fill-bb-flame"
                />
                {last ? null : (
                  <>
                    <rect
                      x={at + shape.repMs}
                      y={0}
                      width={shape.restMs}
                      height={1}
                      className="fill-bb-cadence"
                    />
                    <rect
                      x={at + shape.repMs + shape.restMs}
                      y={0}
                      width={shape.countInMs}
                      height={1}
                      className="fill-bb-yellow"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        {/* The beats, cut into the rep's bar. */}
        {cells.slice(1).map((cell, index) => (
          <span
            key={cell.key}
            data-t={beatAt(index + 1)}
            data-show="2"
            className={`${place} -ml-px h-full w-[3px] bg-surface`}
          />
        ))}
      </div>
      {/* Under the bar: the clock, the slot's parts, or the beats' counts. */}
      <div className="relative h-12 text-caption leading-6 text-muted">
        <span data-show="0" className="absolute left-0 top-0 tabular-nums">
          0:00
        </span>
        <span data-show="0" className="absolute right-0 top-0 tabular-nums">
          {clock(shape.totalMs)}
        </span>
        <span
          data-t={focus}
          data-show="1"
          className={`${place} whitespace-nowrap text-ink`}
        >
          {seconds(shape.repMs)} work
        </span>
        <span
          data-t={restAt}
          data-show="1"
          className={`${place} top-6 whitespace-nowrap`}
        >
          {seconds(shape.restMs)} rest
        </span>
        {shape.countInMs > 0 ? (
          <span
            data-t={countAt}
            data-show="1"
            className={`${place} whitespace-nowrap`}
          >
            {shape.countInMs / 1000}s count-in
          </span>
        ) : null}
        {cells.map((cell, index) => (
          <span
            key={cell.key}
            data-t={beatAt(index)}
            data-d={beatLength(index)}
            data-show="2"
            className={`${place} text-center font-display text-[22px] font-semibold tabular-nums text-ink`}
          >
            {cell.count ?? (
              <span className="font-body text-caption font-normal text-muted">
                {cell.silent}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
