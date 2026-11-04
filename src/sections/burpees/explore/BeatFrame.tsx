import { FRAMES } from "../frames";
import { POSES } from "../burpeeSet";
import { type PlateCell, SET_BEAT_MS, TEMPO_MS } from "./plateCells";
import { cn } from "@/lib/cn";

interface BeatFrameProps {
  cells: readonly PlateCell[];
  playing: number;
}

/**
 * The plate collapsed to one frame, as the app plays it: every drawing
 * mounted, one shown, cut hard on the beat. Beside it the count, and under
 * it the rep's rhythm, each position's bar as long as it is held (the set a
 * second, the rest 0.8s), the one on the beat lit.
 */
export function BeatFrame({ cells, playing }: BeatFrameProps) {
  const at = Math.max(0, playing);
  const cell = cells[at];
  const beat = (index: number) => (index === 0 ? SET_BEAT_MS : TEMPO_MS);
  const total = cells.reduce((sum, _, index) => sum + beat(index), 0);
  return (
    <div aria-hidden="true" className="w-full">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <div className="relative aspect-square border-b border-line-strong">
          {POSES.map((pose) => (
            <img
              key={pose}
              src={FRAMES[pose]}
              alt=""
              width={512}
              height={512}
              decoding="async"
              className={cn(
                "absolute inset-0 size-full select-none object-contain object-bottom",
                pose === cell.pose ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>
        <p className="m-0 min-w-[2ch] pb-2 text-right font-display text-[clamp(96px,11vw,168px)] font-semibold tabular-nums leading-[0.8] tracking-[-0.05em] text-signal">
          {cell.count ?? ""}
          {cell.silent ? (
            <span className="block font-body text-body font-normal tracking-normal text-muted">
              {cell.silent}
            </span>
          ) : null}
        </p>
      </div>
      <div className="mt-5 flex gap-[3px]">
        {cells.map((c, index) => (
          <span
            key={c.key}
            className={cn("h-2", index === at ? "bg-signal" : "bg-line-strong")}
            style={{
              flexGrow: beat(index) / total,
            }}
          />
        ))}
      </div>
      <p className="m-0 mt-2 flex justify-between text-caption text-muted">
        <span>set, 1.0s</span>
        <span>then 0.8s a move</span>
      </p>
    </div>
  );
}
