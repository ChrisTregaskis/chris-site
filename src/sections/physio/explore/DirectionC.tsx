import { motion } from "framer-motion";
import { type CSSProperties, useEffect, useReducer, useRef } from "react";
import { ExploreShell } from "./ExploreShell";
import { INITIAL_LEAK, leakReducer, leakView } from "./leakTest";
import {
  type Org,
  ORG_HEADING,
  ORG_ROWS,
  ORG_STEPS,
  ORG_TINT,
  ORGS,
} from "./organisations";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

/*
 * Direction C, "One table, three layers", with the query on show. The
 * sessions table is three see-through sheets lying exactly on top of each
 * other, one per organisation, under the query that reads it:
 *
 * 1. `select * from sessions` gets every row: one interleaved table.
 * 2. The transaction is stamped with the signed-in organisation, which
 *    filters nothing yet: the sheets sort apart in plain table order, all
 *    equally lit and all inside the one "comes back" bracket, the signed-in
 *    one marked only by a small "current organisation" stamp.
 * 3. The policy slides in as a veil: the signed-in organisation's sheet
 *    comes to the front and glows, well clear of the plane, the others sink
 *    behind it and the bracket closes round the one sheet. Then the leak
 *    test: sign in as any organisation and try to read another's sessions.
 *    The query grows the filter, that organisation's sheet lunges at the
 *    front and falls back behind the veil (which flashes), and the bracket
 *    reads "nothing comes back".
 *
 * No row counts: the query and the picture carry it, with one visually
 * hidden live line for screen readers. The leak-test state is pure
 * (`leakTest.ts`, tested). The stack is decorative and takes no pointer
 * events: its 3D wrappers project over the buttons below it.
 *
 * Real CSS 3D (perspective, preserve-3d), no library. Tilts stay shallow so
 * text on the sheets keeps at least 13px on screen.
 */

const W = 460;
const HEADER = 42;
const ROW_H = 36;
const PAD = 12;
const FULL_H = HEADER + ORG_ROWS.length * ROW_H + PAD;
/** Room for the stack at its tallest (pulled apart). */
const STACK_H = 450;
/** Where the front sheet sits once apart: at the foot of the stack. */
const FRONT_Y = 205;
/**
 * Sorted apart (stage 2), in table order, front to back from the last:
 * each sheet clears the one in front of it by its own height plus a gap.
 */
const SORTED_GAP = 34;
const SORTED_Y = (() => {
  const heights = ORGS.map(
    (org) =>
      HEADER + ORG_ROWS.filter((row) => row.org === org).length * ROW_H + PAD,
  );
  const ys: number[] = [];
  let y = 300;
  for (let place = ORGS.length - 1; place >= 0; place--) {
    ys[place] = y;
    y -= (heights[place - 1] ?? 0) + SORTED_GAP;
  }
  return ys;
})();

const MOVE =
  "transition-[transform,opacity,filter,height] ease-lift motion-reduce:transition-none";

const timing = (index: number): CSSProperties => ({
  transitionDuration: "var(--duration-apart)",
  transitionDelay: `calc(var(--stagger-base) * ${index})`,
});

/** The whole stack's view, per stage: a shallow tilt throughout. */
const VIEW: Record<number, string> = {
  1: "rotateX(20deg)",
  2: "rotateX(26deg) rotateZ(-2deg)",
  3: "rotateX(24deg) rotateZ(-2deg)",
};

interface Pose {
  y: number;
  z: number;
  opacity: number;
  blur: number;
}

/**
 * Where a sheet sits. Lying as one (1). Sorted apart (2), in plain table
 * order by `place` (0 at the back, nobody singled out: nothing is filtered
 * yet). Then (3) by `role`: 0 is the signed-in organisation's, brought to
 * the front well clear of the policy; the rest drop behind it.
 */
function sheetPose(stage: number, role: number, place: number): Pose {
  if (stage === 1) return { y: 0, z: 0, opacity: 1, blur: 0 };
  if (stage === 2) {
    const back = ORGS.length - 1 - place;
    return { y: SORTED_Y[place] ?? 0, z: -back * 50, opacity: 1, blur: 0 };
  }
  if (role === 0) {
    return { y: FRONT_Y, z: 80, opacity: 1, blur: 0 };
  }
  return {
    y: FRONT_Y - 200 - (role - 1) * 80,
    z: -150 - (role - 1) * 60,
    opacity: 1,
    blur: 0,
  };
}

/** A sheet's edge in its organisation's colour; the signed-in one's glows. */
function edge(org: Org, lit: boolean): string {
  const colour = `var(--color-${ORG_TINT[org].token})`;
  return lit
    ? `inset 0 0 0 1.5px rgb(${colour} / 0.95), 0 0 48px -12px rgb(${colour} / 0.55)`
    : `inset 0 0 0 1px rgb(${colour} / 0.4)`;
}

interface SheetProps {
  org: Org;
  role: number;
  /** Its place in table order (for the sorted, unfiltered stage). */
  place: number;
  /** The organisation on the transaction: carries the stamp. */
  current: boolean;
  stage: number;
  asking: boolean;
  /** Bumps up against the policy each time this changes (the leak test). */
  bump: number | null;
  still: boolean;
}

/** One organisation's rows on its own see-through sheet. */
function Sheet({
  org,
  role,
  place,
  current,
  stage,
  asking,
  bump,
  still,
}: SheetProps) {
  const apart = stage >= 2;
  const pose = sheetPose(stage, role, place);
  const mine = ORG_ROWS.map((row, index) => ({ row, index })).filter(
    ({ row }) => row.org === org,
  );
  const height = apart ? HEADER + mine.length * ROW_H + PAD : FULL_H;
  const trying = bump !== null;
  // Asking for someone else's rows: the signed-in sheet's own rows don't match.
  const quiet = asking && role === 0;
  // Only the policy singles a sheet out: the glow is for stage 3.
  const lit = stage >= 3 && ((role === 0 && !asking) || trying);
  const order = stage === 2 ? ORGS.length - 1 - place : role;

  return (
    <div
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        ...timing(order),
        width: W,
        height: FULL_H,
        transform: `translate3d(0, ${pose.y}px, ${pose.z}px)`,
        opacity: pose.opacity,
        filter: `blur(${pose.blur}px)`,
      }}
    >
      <motion.div
        key={trying ? `bump-${bump}` : "rest"}
        className="absolute inset-0 [transform-style:preserve-3d]"
        animate={
          trying && bump > 0 && !still ? { y: [0, 84, 0, 28, 0] } : undefined
        }
        transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
      >
        {/* The sheet itself: only there once the table has come apart. */}
        <div
          aria-hidden="true"
          data-plate={org}
          className={cn(
            MOVE,
            "absolute inset-x-0 top-0 rounded-[14px] bg-raised",
            apart ? "opacity-100" : "opacity-0",
          )}
          style={{
            ...timing(order),
            height,
            boxShadow: edge(org, lit),
          }}
        />
        <p
          className={cn(
            MOVE,
            "absolute right-5 top-[11px] m-0 text-[16px] font-medium text-accent",
            apart && current ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: "var(--duration-slow)" }}
        >
          current organisation
        </p>
        <p
          className={cn(
            MOVE,
            "absolute left-5 top-[11px] m-0 flex items-center gap-2 text-[17px] font-semibold",
            ORG_TINT[org].text,
            apart ? "opacity-100" : "opacity-0",
          )}
          style={timing(order)}
        >
          <i
            aria-hidden="true"
            className={cn("size-[9px] rounded-pill", ORG_TINT[org].bg)}
          />
          {org}
        </p>
        {mine.map(({ row, index }, compact) => (
          <div
            key={row.label}
            className={cn(
              MOVE,
              "absolute inset-x-5 grid grid-cols-[12px_1fr_auto] items-center gap-[10px] text-[17px]",
              quiet ? "text-muted" : "text-ink",
            )}
            style={{
              ...timing(order),
              height: ROW_H,
              transform: `translateY(${HEADER + (apart ? compact : index) * ROW_H}px)`,
            }}
          >
            <i
              aria-hidden="true"
              className={cn("size-[10px] rounded-pill", ORG_TINT[org].bg)}
            />
            <span className="leading-none">{row.label}</span>
            <small
              className={cn(
                MOVE,
                "text-[15px] leading-none text-muted",
                apart ? "opacity-0" : "opacity-100",
              )}
              style={{ transitionDuration: "var(--duration-slow)" }}
            >
              {org}
            </small>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface SignedInPickerProps {
  named: boolean;
  live: boolean;
  who: Org;
  onPick: (org: Org) => void;
}

/** Who's asking: shown once the request names its organisation, a picker once the policy is in. */
function SignedInPicker({ named, live, who, onPick }: SignedInPickerProps) {
  return (
    <div
      role={live ? "group" : undefined}
      aria-label={live ? "Signed in as" : undefined}
      className={cn(
        "flex min-h-[28px] flex-wrap items-baseline gap-x-5 gap-y-1 text-[15px] transition-opacity duration-slow motion-reduce:transition-none",
        named ? "opacity-100" : "opacity-0",
      )}
    >
      <span className="text-muted">Signed in as</span>
      {ORGS.map((org) => {
        const chosen = org === who;
        const shown = live || chosen;
        return (
          <button
            key={org}
            type="button"
            disabled={!live}
            tabIndex={live ? 0 : -1}
            aria-pressed={live ? chosen : undefined}
            onClick={() => onPick(org)}
            data-testid={`pick-${org}`}
            className={cn(
              "flex items-center gap-2 border-0 border-b-2 border-transparent bg-transparent p-0 pb-[2px] font-medium text-muted transition-[color,opacity] duration-base hover:text-ink disabled:cursor-default motion-reduce:transition-none",
              chosen && "text-ink",
              chosen && live && "border-current",
              shown ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <i
              aria-hidden="true"
              className={cn("size-[8px] rounded-pill", ORG_TINT[org].bg)}
            />
            {org}
          </button>
        );
      })}
    </div>
  );
}

interface PolicyPlaneProps {
  live: boolean;
  /** Flashes each time this changes (an attempt bumping into it); 0 is at rest. */
  pulse: number;
  still: boolean;
}

/** The policy: a plane slid in under the signed-in organisation's sheet. */
function PolicyPlane({ live, pulse, still }: PolicyPlaneProps) {
  const flash = pulse > 0 && !still;
  return (
    <div
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        transitionDuration: "var(--duration-apart)",
        transitionDelay: live ? "var(--duration-state)" : undefined,
        width: W + 80,
        height: 430,
        transform: `translate3d(${live ? -40 : -80}px, ${FRONT_Y - 235}px, -40px)`,
        opacity: live ? 1 : 0,
      }}
    >
      <motion.div
        key={`plane-${pulse}`}
        className="absolute inset-0 rounded-[14px] border-2 border-dashed border-accent/70 bg-surface/75"
        animate={flash ? { scale: [1, 1, 1.015, 1] } : undefined}
        transition={{
          duration: DURATION.apart,
          times: [0, 0.3, 0.42, 1],
        }}
      >
        <motion.span
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={flash ? { opacity: [0, 0, 0.28, 0] } : { opacity: 0 }}
          transition={{
            duration: DURATION.apart,
            times: [0, 0.3, 0.42, 1],
          }}
        />
        <p className="absolute right-5 top-3 m-0 whitespace-nowrap text-[16px] font-medium text-accent">
          policy: organisation_id = current organisation
        </p>
      </motion.div>
    </div>
  );
}

interface LeakTestProps {
  live: boolean;
  target: Org;
  asking: boolean;
  onTry: () => void;
  onReset: () => void;
}

/** The leak test, once the policy is in. */
function LeakTest({ live, target, asking, onTry, onReset }: LeakTestProps) {
  return (
    <div
      className={cn(
        "relative z-[1] flex min-h-[30px] flex-wrap items-baseline gap-x-5 gap-y-2 text-[15px] transition-opacity duration-slow motion-reduce:transition-none",
        live ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!live}
    >
      <button
        type="button"
        tabIndex={live ? 0 : -1}
        onClick={onTry}
        data-testid="leak-try"
        className="border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent"
      >
        Try to read {target}&rsquo;s sessions
      </button>
      {asking ? (
        <button
          type="button"
          onClick={onReset}
          data-testid="leak-reset"
          className="border-0 bg-transparent p-0 text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Ask for every session again
        </button>
      ) : null}
    </div>
  );
}

interface FigureProps {
  stage: number;
  still: boolean;
}

function Figure({ stage, still }: FigureProps) {
  const [leak, dispatch] = useReducer(leakReducer, INITIAL_LEAK);
  const { who, target, asking, returned, outcome } = leakView(stage, leak);
  const named = stage >= 2;
  const live = stage >= 3;
  // Front to back once the policy is in: the signed-in organisation first.
  const order = [who, ...ORGS.filter((o) => o !== who)];
  const bump = asking ? leak.attempt : 0;

  // The bracket marks what comes back. The sheets move in 3D, so it reads
  // their projected boxes each frame while they settle (direct DOM writes).
  const stackRef = useRef<HTMLDivElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const brackets =
    stage === 1
      ? '[data-plate="all"]'
      : (returned.length ? returned : [who])
          .map((org) => `[data-plate="${org}"]`)
          .join(",");
  useEffect(() => {
    const stack = stackRef.current;
    const bracket = bracketRef.current;
    if (!stack || !bracket) return undefined;
    let frame = 0;
    const until = performance.now() + 2800;
    const fit = () => {
      const box = stack.getBoundingClientRect();
      let top = Infinity;
      let bottom = -Infinity;
      stack.querySelectorAll(brackets).forEach((plate) => {
        const rect = plate.getBoundingClientRect();
        top = Math.min(top, rect.top);
        bottom = Math.max(bottom, rect.bottom);
      });
      if (top < bottom) {
        bracket.style.top = `${top - box.top}px`;
        bracket.style.height = `${bottom - top}px`;
      }
      if (performance.now() < until) frame = requestAnimationFrame(fit);
    };
    fit();
    return () => cancelAnimationFrame(frame);
  }, [brackets]);

  let bracketLabel = "comes back";
  if (!live) bracketLabel = "all of it comes back";
  else if (asking) bracketLabel = "nothing comes back";

  return (
    <figure
      className="m-0 w-full max-w-[560px]"
      aria-label="A query against one sessions table holding every organisation's rows, drawn as one see-through sheet per organisation"
    >
      <SignedInPicker
        named={named}
        live={live}
        who={who}
        onPick={(org) => dispatch({ type: "pick", org })}
      />
      {/* The transaction and its query, set as type. */}
      <div className="mt-3 font-display font-medium tracking-[-0.02em]">
        <p
          className={cn(
            "m-0 text-[22px] leading-[1.25] transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="text-muted">set local</span> organisation ={" "}
          <span className={ORG_TINT[who].text}>&lsquo;{who}&rsquo;</span>
        </p>
        <p className="m-0 text-[30px] leading-[1.25]">
          <span className="text-muted">select</span> *{" "}
          <span className="text-muted">from</span> sessions
        </p>
        <p
          className={cn(
            "m-0 min-h-[1.25em] text-[30px] leading-[1.25] transition-opacity duration-slow motion-reduce:transition-none",
            asking ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!asking}
          data-testid="leak-filter"
        >
          <span className="text-muted">where</span> organisation_id ={" "}
          <span className={ORG_TINT[target].text}>&lsquo;{target}&rsquo;</span>
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {outcome}
      </p>

      {/* The table: one see-through sheet per organisation. Decorative (the query and the line above say it), and never in the way of a click. */}
      <div
        ref={stackRef}
        aria-hidden="true"
        data-testid="leak-stack"
        className="pointer-events-none relative mt-4 [perspective:1800px] [perspective-origin:50%_100%]"
        style={{ width: W, height: STACK_H }}
      >
        <div
          className={cn(
            MOVE,
            "absolute inset-x-0 top-[24px] [transform-style:preserve-3d]",
          )}
          style={{
            transitionDuration: "var(--duration-apart)",
            transform: VIEW[stage] ?? VIEW[3],
          }}
        >
          {/* The one table's plate, while the sheets still lie as one. */}
          <div
            data-plate="all"
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
          >
            <p className="absolute left-5 top-[12px] m-0 text-[15px] text-muted">
              one table, every organisation
            </p>
          </div>
          {ORGS.map((org, place) => (
            <Sheet
              key={org}
              org={org}
              role={order.indexOf(org)}
              place={place}
              current={org === who}
              stage={stage}
              asking={asking}
              bump={asking && org === target ? bump : null}
              still={still}
            />
          ))}
          <PolicyPlane live={live} pulse={bump} still={still} />
        </div>
        {/* What comes back: one bracket around every sheet in the result. */}
        <div
          ref={bracketRef}
          className="absolute flex items-center"
          style={{ left: W + 56, top: 0, height: 0 }}
        >
          <span
            className={cn(
              "h-full w-[10px] rounded-r-[3px] border-y-2 border-r-2",
              returned.length ? "border-accent" : "border-dashed border-muted",
            )}
          />
          <span
            className={cn(
              "ml-2 whitespace-nowrap text-[15px] font-medium [writing-mode:vertical-rl]",
              returned.length ? "text-accent" : "text-muted",
            )}
          >
            {bracketLabel}
          </span>
        </div>
      </div>

      <LeakTest
        live={live}
        target={target}
        asking={asking}
        onTry={() => dispatch({ type: "try" })}
        onReset={() => dispatch({ type: "reset" })}
      />
    </figure>
  );
}

export function DirectionC() {
  return (
    <ExploreShell
      heading={ORG_HEADING}
      steps={ORG_STEPS}
      renderStage={(stage, still) => <Figure stage={stage} still={still} />}
    />
  );
}
