import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, rowsOf } from "../organisations";
import { FACE } from "./sceneMeasures";
import { MOVE_3D, rowTransition } from "./sheetMotion";
import { cn } from "@/lib/cn";

interface SheetRowsProps {
  org: Org;
  spot: Spot;
  /** Held rows fade as the sheet goes, rather than folding away at once (draft C). */
  slow: boolean;
  still: boolean;
}

/**
 * Exploration: a phone sheet's rows. At rest each sits at its place in the
 * one table, its organisation beside it; as the result they close up under
 * the name; held, they fold away.
 */
export function SheetRows({ org, spot, slow, still }: SheetRowsProps) {
  const atRest = spot.at === "table";
  const open = atRest || spot.at === "result";
  return (
    <>
      {rowsOf(org).map(({ row, index }, own) => (
        <div
          key={row.label}
          className="absolute top-0 grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2 text-[15px] leading-none text-ink"
          style={{
            left: FACE.side,
            right: FACE.side,
            height: FACE.row,
            transform: `translateY(${FACE.head + (atRest ? index : own) * FACE.row}px)`,
            opacity: open ? 1 : 0,
            transition: rowTransition(open, still, slow),
          }}
        >
          <i className={cn("size-[8px] rounded-pill", ORG_TINT[org].bg)} />
          <span className="truncate">{row.label}</span>
          <small
            className={cn(
              MOVE_3D,
              "text-[15px] text-muted",
              atRest ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: "var(--duration-slow)" }}
          >
            {org}
          </small>
        </div>
      ))}
    </>
  );
}
