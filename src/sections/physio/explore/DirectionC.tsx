import { type CSSProperties } from "react";
import { ExploreShell } from "./ExploreShell";
import { HOME, type Practice, PRACTICES, ROWS, TINT } from "./practices";
import { cn } from "@/lib/cn";

/*
 * Direction C, "One table, three layers": the sessions table is drawn as
 * three transparent sheets lying exactly on top of each other, one per
 * practice, so at first they read as one interleaved table (1). Naming the
 * practice pulls the sheets apart in depth, each practice's rows closing up
 * on its own sheet, Riverside's in front (2). Then the policy slides in
 * behind Riverside's sheet and the others fall back into the dark (3).
 * Real CSS 3D (perspective, preserve-3d), no library. What it adds over the
 * list: tenancy as a shape. One table is several practices' rows laid over
 * each other, and isolation is which sheet you're allowed to see.
 */

const W = 480;
const HEADER = 50;
const ROW_H = 42;
const FULL_H = HEADER + ROWS.length * ROW_H + 14;

const MOVE =
  "transition-[transform,opacity,filter,height] ease-lift motion-reduce:transition-none";

const timing = (index: number): CSSProperties => ({
  transitionDuration: "var(--duration-apart)",
  transitionDelay: `calc(var(--stagger-base) * ${index})`,
});

/** The whole stack's view, per stage: nearly upright, laid back and opened out, settled. */
const VIEW: Record<number, string> = {
  1: "rotateX(36deg) rotateZ(-3deg)",
  2: "rotateX(58deg) rotateZ(-6deg)",
  3: "rotateX(44deg) rotateZ(-4deg)",
};

/** How high each practice's sheet floats off the table, per stage (0 is the front). */
function sheetLift(stage: number, depth: number): number {
  if (stage === 1) return 0;
  if (stage === 2) return 20 - depth * 130;
  return depth === 0 ? 80 : -110 - depth * 36;
}

/** Where the policy plane floats: just under the signed-in practice's sheet. */
const POLICY_LIFT = 0;

const EDGE_TOKEN: Record<Practice, string> = {
  Riverside: "accent",
  Harbour: "signal",
  Moorland: "tenant-teal",
};

/** A sheet's edge in its practice's colour; the named practice's glows. */
function edge(practice: Practice, named: boolean): string {
  const colour = `var(--color-${EDGE_TOKEN[practice]})`;
  return named
    ? `inset 0 0 0 1.5px rgb(${colour} / 0.95), 0 0 48px -12px rgb(${colour} / 0.55)`
    : `inset 0 0 0 1px rgb(${colour} / 0.4)`;
}

interface SheetProps {
  practice: Practice;
  depth: number;
  stage: number;
}

/** One practice's rows on its own transparent sheet. */
function Sheet({ practice, depth, stage }: SheetProps) {
  const apart = stage >= 2;
  const behind = stage >= 3 && practice !== HOME;
  const mine = ROWS.map((row, index) => ({ row, index })).filter(
    ({ row }) => row.practice === practice,
  );
  const height = apart ? HEADER + mine.length * ROW_H + 14 : FULL_H;

  return (
    <div
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        ...timing(depth),
        width: W,
        height: FULL_H,
        transform: `translateZ(${sheetLift(stage, depth)}px)`,
        opacity: behind ? 0.22 : 1,
        filter: behind ? "blur(1.5px)" : "blur(0px)",
      }}
    >
      {/* The sheet itself: only there once the table has come apart. */}
      <div
        aria-hidden="true"
        className={cn(
          MOVE,
          "absolute inset-x-0 top-0 rounded-[14px] bg-raised/90",
          apart ? "opacity-100" : "opacity-0",
        )}
        style={{
          ...timing(depth),
          height,
          boxShadow: edge(practice, apart && practice === HOME),
        }}
      />
      <p
        className={cn(
          MOVE,
          "absolute left-5 top-[16px] m-0 flex items-center gap-2 text-[15px] font-medium",
          TINT[practice].text,
          apart ? "opacity-100" : "opacity-0",
        )}
        style={timing(depth)}
      >
        <i
          aria-hidden="true"
          className={cn("size-[8px] rounded-pill", TINT[practice].bg)}
        />
        {practice}
      </p>
      {mine.map(({ row, index }, compact) => (
        <div
          key={row.label}
          className={cn(
            MOVE,
            "absolute inset-x-5 grid grid-cols-[12px_1fr_auto] items-center gap-[10px] text-[18px] text-ink",
          )}
          style={{
            ...timing(depth),
            height: ROW_H,
            transform: `translateY(${HEADER + (apart ? compact : index) * ROW_H}px)`,
          }}
        >
          <i
            aria-hidden="true"
            className={cn("size-[10px] rounded-pill", TINT[row.practice].bg)}
          />
          <span className="leading-none">{row.label}</span>
          <small className="text-[12px] leading-none text-muted">
            {row.practice}
          </small>
        </div>
      ))}
    </div>
  );
}

function Figure({ stage }: { stage: number }) {
  const named = stage >= 2;
  const closed = stage >= 3;
  // Front to back: the signed-in practice first.
  const order = [HOME, ...PRACTICES.filter((p) => p !== HOME)];

  return (
    <figure
      className="m-0 w-full max-w-[600px]"
      aria-label="The sessions table as three practices' rows laid over each other, pulled apart into one sheet per practice, with only the signed-in practice's sheet in view"
    >
      <div className="grid gap-1 pl-2 text-[14px]">
        <p className="m-0 text-muted">sessions: one table, every practice</p>
        <p
          className={cn(
            "m-0 font-medium text-accent transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-100" : "opacity-0",
          )}
        >
          current practice: {HOME}
        </p>
        <p
          className={cn(
            "m-0 text-ink transition-opacity duration-slow motion-reduce:transition-none",
            closed ? "opacity-100" : "opacity-0",
          )}
          style={{
            transitionDelay: closed ? "var(--duration-apart)" : undefined,
          }}
        >
          {HOME} sees one sheet. The others are still in the table.
        </p>
      </div>
      <div
        className="relative mx-auto mt-6 [perspective:1600px] [perspective-origin:50%_30%]"
        style={{ width: W, height: FULL_H + 130 }}
      >
        <div
          className={cn(
            MOVE,
            "absolute inset-x-0 top-[70px] [transform-style:preserve-3d]",
          )}
          style={{
            transitionDuration: "var(--duration-apart)",
            transform: VIEW[stage] ?? VIEW[3],
          }}
        >
          {/* The one table's plate, while the sheets still lie as one. */}
          <div
            aria-hidden="true"
            className={cn(
              MOVE,
              "absolute left-0 top-0 rounded-[14px] bg-raised/60",
              named ? "opacity-0" : "opacity-100",
            )}
            style={{
              transitionDuration: "var(--duration-slow)",
              width: W,
              height: FULL_H,
              transform: "translateZ(-2px)",
            }}
          />
          {/* Back to front, so the front sheet paints last. */}
          {[...order].reverse().map((practice) => (
            <Sheet
              key={practice}
              practice={practice}
              depth={order.indexOf(practice)}
              stage={stage}
            />
          ))}
          {/* The policy: a plane slid in just behind the signed-in practice's sheet. */}
          <div
            aria-hidden="true"
            className={cn(
              MOVE,
              "absolute left-0 top-0 rounded-[14px] border-2 border-dashed border-accent/70 bg-accent/[0.07]",
            )}
            style={{
              transitionDuration: "var(--duration-apart)",
              transitionDelay: closed ? "var(--duration-state)" : undefined,
              width: W + 40,
              height: HEADER + 3 * ROW_H + 40,
              transform: closed
                ? `translate3d(-20px, -14px, ${POLICY_LIFT}px)`
                : `translate3d(-560px, -14px, ${POLICY_LIFT}px)`,
              opacity: closed ? 1 : 0,
            }}
          >
            <p className="absolute bottom-3 right-5 m-0 whitespace-nowrap text-[15px] font-medium text-accent">
              policy: tenant_id = current practice
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function DirectionC() {
  return <ExploreShell renderStage={(stage) => <Figure stage={stage} />} />;
}
