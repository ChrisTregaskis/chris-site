import { AnimatePresence, motion } from "framer-motion";
import { FRAMES } from "../frames";
import { type PlateCell } from "./plateCells";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface PlateProps {
  cells: readonly PlateCell[];
  /** The position on the beat now; -1 when nothing plays (every cell shown). */
  playing: number;
  still: boolean;
}

/**
 * A motion study after the old chronophotograph plates: one rep laid out
 * position by position, four to a row, each row on its own ground line, the
 * count spoken on each position written under it. A cell the next plate
 * shares keeps its key, so changing burpee moves the shared cells into place
 * and lets the rest go.
 */
export function Plate({ cells, playing, still }: PlateProps) {
  const transition = still
    ? { duration: 0 }
    : { duration: DURATION.slow, ease: EASE.enter };
  return (
    <ol
      aria-hidden="true"
      className="m-0 grid w-full list-none grid-cols-4 gap-y-3 p-0"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {cells.map((cell, index) => {
          const on = playing < 0 || index === playing;
          return (
            <motion.li
              key={cell.key}
              layout={!still}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={transition}
              className="relative"
            >
              <div className="relative aspect-square border-b border-line-strong">
                <img
                  src={FRAMES[cell.pose]}
                  alt=""
                  width={512}
                  height={512}
                  decoding="async"
                  className={cn(
                    "absolute inset-0 size-full select-none object-contain object-bottom",
                    on ? "opacity-100" : "opacity-30",
                  )}
                />
              </div>
              <p
                className={cn(
                  "m-0 mt-1 flex items-baseline gap-2 font-display tabular-nums leading-none",
                  on ? "text-ink" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "text-[30px] font-semibold tracking-[-0.03em]",
                    index === playing && "text-signal",
                  )}
                >
                  {cell.count ?? ""}
                </span>
                {cell.silent ? (
                  <span className="font-body text-caption">{cell.silent}</span>
                ) : null}
              </p>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}
