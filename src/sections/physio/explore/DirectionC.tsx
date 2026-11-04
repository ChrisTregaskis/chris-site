import { motion } from "framer-motion";
import { type CSSProperties, useReducer } from "react";
import { ExploreShell } from "./ExploreShell";
import {
  INITIAL_LEAK,
  leakReducer,
  leakView,
  type Spot,
  spotOf,
} from "./leakTest";
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
 * sessions table is three see-through sheets, one per organisation, under
 * the query that reads it:
 *
 * 1. The table at rest: the sheets lie exactly on top of each other as one
 *    table, every organisation's rows interleaved. No request, no query,
 *    just the table's name.
 * 2. A request signed in as Alder: `set local`, then `select * from
 *    sessions`. The policy is always on, so it slides in as a veil and only
 *    Alder's sheet comes back: it lifts out in front and glows, while the
 *    rest of the table stays behind the veil.
 * 3. The same picture with the policy named, and the leak test: sign in as
 *    anyone and ask for another organisation's sessions by name. Your own
 *    sheet drops back into the table, theirs tries to come forward, hits
 *    the policy and falls back, and the result is an empty sheet.
 *
 * No numbers: the query, the picture and one plain line under the query
 * carry it (with a screen-reader twin). The state and where each sheet
 * sits are pure (`leakTest.ts`, tested). The stack is decorative and takes
 * no pointer events: its 3D wrappers project over the buttons below it.
 *
 * Real CSS 3D (perspective, preserve-3d), no library. Tilts stay shallow so
 * the text you can see on the sheets stays at about 14px or more on screen.
 */

const W = 460;
const HEADER = 42;
const ROW_H = 36;
const PAD = 12;
const FULL_H = HEADER + ORG_ROWS.length * ROW_H + PAD;
/** Room for the stack at its tallest. */
const STACK_H = 450;
/** The one table at rest: high in the stack, close under its name. */
const TABLE = { y: -36, z: 0 };
/** The result: out in front, at the foot of the stack. */
const RESULT = { y: 205, z: 80 };
/** The pile behind the policy: its front slot, and each slot further back. */
const HELD = { y: 40, z: -95, stepY: 64, stepZ: 25 };
/** The policy plane's top edge and height, with room all round. */
const PLANE = { y: -60, h: 445 };
/** The empty result: as big as the largest result, so it covers the pile the same way. */
const EMPTY_H = HEADER + 3 * ROW_H + PAD;

const MOVE =
  "transition-[transform,opacity,height,box-shadow] ease-lift motion-reduce:transition-none";

const timing = (index: number): CSSProperties => ({
  transitionDuration: "var(--duration-apart)",
  transitionDelay: `calc(var(--stagger-base) * ${index})`,
});

/** The whole stack's view: flatter at rest, a little more tilted once apart. */
const VIEW = {
  rest: "rotateX(20deg)",
  apart: "rotateX(24deg) rotateZ(-2deg)",
};

function pose(spot: Spot): { y: number; z: number } {
  if (spot.at === "table") return TABLE;
  if (spot.at === "result") return RESULT;
  return {
    y: HELD.y - spot.slot * HELD.stepY,
    z: HELD.z - spot.slot * HELD.stepZ,
  };
}

/** A sheet's edge in its organisation's colour; the result's glows. */
function edge(org: Org, lit: boolean): string {
  const colour = `var(--color-${ORG_TINT[org].token})`;
  return lit
    ? `inset 0 0 0 1.5px rgb(${colour} / 0.95), 0 0 48px -12px rgb(${colour} / 0.55)`
    : `inset 0 0 0 1px rgb(${colour} / 0.4)`;
}

interface SheetProps {
  org: Org;
  spot: Spot;
  /** Lunges at the policy each time this changes (the leak test); null when not asked for. */
  bump: number | null;
  still: boolean;
}

/** One organisation's rows on its own see-through sheet. */
function Sheet({ org, spot, bump, still }: SheetProps) {
  const apart = spot.at !== "table";
  const { y, z } = pose(spot);
  const mine = ORG_ROWS.map((row, index) => ({ row, index })).filter(
    ({ row }) => row.org === org,
  );
  const height = apart ? HEADER + mine.length * ROW_H + PAD : FULL_H;
  const order = spot.at === "held" ? spot.slot : 0;
  const lunge = bump !== null && bump > 0 && !still;

  return (
    <div
      data-sheet={org}
      data-spot={spot.at}
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        ...timing(order),
        width: W,
        height: FULL_H,
        transform: `translate3d(0, ${y}px, ${z}px)`,
      }}
    >
      <motion.div
        key={lunge ? `bump-${bump}` : "rest"}
        className="absolute inset-0 [transform-style:preserve-3d]"
        animate={
          lunge ? { y: [0, 48, 0, 16, 0], z: [0, 72, 0, 22, 0] } : undefined
        }
        transition={{
          delay: DURATION.state,
          duration: DURATION.apart,
          ease: [...EASE.lift],
          times: [0, 0.32, 0.62, 0.8, 1],
        }}
      >
        {/* The sheet itself: only there once the table has come apart. */}
        <div
          aria-hidden="true"
          className={cn(
            MOVE,
            "absolute inset-x-0 top-0 rounded-[14px] bg-raised",
            apart ? "opacity-100" : "opacity-0",
          )}
          style={{
            ...timing(order),
            height,
            boxShadow: edge(org, spot.at === "result"),
          }}
        />
        <p
          className={cn(
            MOVE,
            "absolute left-5 top-[9px] m-0 flex items-center gap-2 text-[19px] font-semibold",
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
              "absolute inset-x-5 grid grid-cols-[12px_1fr_auto] items-center gap-[10px] text-[17px] text-ink",
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
                "text-[16px] leading-none text-muted",
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

interface EmptyResultProps {
  shown: boolean;
}

/** Nothing comes back: an empty sheet where the result would be. */
function EmptyResult({ shown }: EmptyResultProps) {
  return (
    <div
      data-testid="empty-result"
      data-shown={shown}
      className={cn(
        "absolute left-0 top-0 flex items-center justify-center rounded-[14px] border-2 border-dashed border-muted/80 bg-surface transition-opacity motion-reduce:transition-none",
        shown ? "opacity-100" : "opacity-0",
      )}
      style={{
        // In after the attempt has hit the policy; out at once.
        transitionDuration: shown
          ? "var(--duration-slow)"
          : "var(--duration-fast)",
        transitionDelay: shown
          ? "calc(var(--duration-state) + var(--duration-state))"
          : undefined,
        width: W,
        height: EMPTY_H,
        transform: `translate3d(0, ${RESULT.y}px, ${RESULT.z}px)`,
      }}
    >
      <p className="m-0 text-[19px] font-medium text-muted">No sessions</p>
    </div>
  );
}

interface SignedInPickerProps {
  named: boolean;
  live: boolean;
  who: Org;
  onPick: (org: Org) => void;
}

/** Who's asking: shown once a request arrives, a picker once the leak test is open. */
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
  /** In from the first request on: the policy is always on. */
  live: boolean;
  /** Named and brought up for the leak test, which is testing it. */
  named: boolean;
  /** Flashes each time this changes (an attempt hitting it); 0 is at rest. */
  pulse: number;
  still: boolean;
}

/** The policy: a veil between the result and the rest of the table. */
function PolicyPlane({ live, named, pulse, still }: PolicyPlaneProps) {
  const flash = pulse > 0 && !still;
  const hit = {
    delay: DURATION.state,
    duration: DURATION.apart,
    times: [0, 0.3, 0.42, 1],
  };
  return (
    <div
      data-plane
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        transitionDuration: "var(--duration-apart)",
        transitionDelay: live ? "var(--duration-state)" : undefined,
        width: W + 80,
        height: PLANE.h,
        transform: `translate3d(${live ? -40 : -80}px, ${PLANE.y}px, -40px)`,
        opacity: live ? 1 : 0,
      }}
    >
      {/* Remounted per attempt, so each one replays the hit. */}
      <motion.div
        key={`plane-${pulse}`}
        className={cn(
          "absolute inset-0 rounded-[14px] border-2 border-dashed bg-surface/65 transition-[border-color,box-shadow] duration-slow motion-reduce:transition-none",
          named
            ? "border-accent shadow-[0_0_72px_-20px_rgb(var(--color-accent)/0.55)]"
            : "border-line-strong",
        )}
        animate={flash ? { scale: [1, 1, 1.015, 1] } : undefined}
        transition={hit}
      >
        <motion.span
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={flash ? { opacity: [0, 0, 0.28, 0] } : { opacity: 0 }}
          transition={hit}
        />
        <div className="absolute bottom-3 left-6 whitespace-nowrap">
          <p
            className={cn(
              "m-0 text-[18px] font-semibold text-accent transition-opacity duration-slow motion-reduce:transition-none",
              named ? "opacity-100" : "opacity-0",
            )}
          >
            row-level security
          </p>
          <p
            className={cn(
              "m-0 text-[16px] font-medium transition-colors duration-slow motion-reduce:transition-none",
              named ? "text-accent" : "text-muted",
            )}
          >
            policy: organisation_id = current organisation
          </p>
        </div>
      </motion.div>
      {/* A soft flash, once, as the policy is named for the leak test. */}
      <motion.span
        key={named ? "named" : "quiet"}
        className="absolute inset-0 rounded-[14px] bg-accent"
        initial={{ opacity: 0 }}
        animate={named && !still ? { opacity: [0, 0.14, 0] } : { opacity: 0 }}
        transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
      />
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

/** The leak test, in the last step. */
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
  const view = leakView(stage, leak);
  const { asked, testing, who, target, asking, returned } = view;
  const bump = asking ? leak.attempt : 0;

  return (
    <figure
      className="m-0 w-full max-w-[560px]"
      aria-label="A query against one sessions table holding every organisation's rows, drawn as one see-through sheet per organisation"
    >
      <SignedInPicker
        named={asked}
        live={testing}
        who={who}
        onPick={(org) => dispatch({ type: "pick", org })}
      />
      {/*
       * The transaction and its query, set as type (at rest, just the
       * table's name), then what comes back in one plain line, its twin
       * speaking it in full. The block keeps room for the leak test's
       * filter, so the stack below never moves.
       */}
      <div className="mt-3 min-h-[132px]">
        <div className="font-display text-[28px] font-medium leading-[1.25] tracking-[-0.02em]">
          <p
            className={cn(
              "m-0 transition-opacity duration-slow motion-reduce:transition-none",
              asked ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!asked}
          >
            <span className="text-muted">set local</span> organisation ={" "}
            <span className={ORG_TINT[who].text}>&lsquo;{who}&rsquo;</span>
          </p>
          <p className="m-0">
            {/* The query grows in front of the table's name (0fr to 1fr). */}
            <span
              data-testid="query-select"
              aria-hidden={!asked}
              className={cn(
                "inline-grid transition-[grid-template-columns,opacity] duration-slow ease-lift motion-reduce:transition-none",
                asked
                  ? "grid-cols-[1fr] opacity-100"
                  : "grid-cols-[0fr] opacity-0",
              )}
            >
              <span className="overflow-hidden whitespace-nowrap">
                <span className="text-muted">select</span> *{" "}
                <span className="text-muted">from</span>&nbsp;
              </span>
            </span>
            sessions
          </p>
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-slow ease-lift motion-reduce:transition-none",
              asking
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <p
              className="m-0 overflow-hidden whitespace-nowrap"
              aria-hidden={!asking}
              data-testid="leak-filter"
            >
              <span className="text-muted">where</span> organisation_id ={" "}
              <span className={ORG_TINT[target].text}>
                &lsquo;{target}&rsquo;
              </span>
            </p>
          </div>
        </div>
        <p
          aria-hidden="true"
          data-testid="leak-line"
          className="m-0 mt-1 text-[15px] leading-[1.5] text-ink"
        >
          <motion.span
            key={view.line}
            className="block"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.slow }}
          >
            {view.line}
          </motion.span>
        </p>
        <p className="sr-only" aria-live="polite">
          {view.spoken}
        </p>
      </div>

      {/* The table: one see-through sheet per organisation. Decorative (the query and the line above say it), and never in the way of a click. */}
      <div
        aria-hidden="true"
        data-testid="leak-stack"
        className="pointer-events-none relative mt-5 [perspective:1800px] [perspective-origin:50%_100%]"
        style={{ width: W, height: STACK_H }}
      >
        <div
          className={cn(
            MOVE,
            "absolute inset-x-0 top-[24px] [transform-style:preserve-3d]",
          )}
          style={{
            transitionDuration: "var(--duration-apart)",
            transform: asked ? VIEW.apart : VIEW.rest,
          }}
        >
          {/* The one table's plate and its columns, while the sheets lie as one. */}
          <div
            className={cn(
              MOVE,
              "absolute left-0 top-0 rounded-[14px] bg-raised/60",
              asked ? "opacity-0" : "opacity-100",
            )}
            style={{
              transitionDuration: "var(--duration-slow)",
              width: W,
              height: FULL_H,
              transform: `translate3d(0, ${TABLE.y}px, ${TABLE.z - 2}px)`,
            }}
          >
            <p className="absolute inset-x-5 top-[12px] m-0 flex justify-between pl-[22px] text-[17px] text-muted">
              <span>session</span>
              <span>organisation_id</span>
            </p>
          </div>
          {ORGS.map((org) => (
            <Sheet
              key={org}
              org={org}
              spot={spotOf(view, org)}
              bump={asking && org === target ? bump : null}
              still={still}
            />
          ))}
          <PolicyPlane
            live={asked}
            named={testing}
            pulse={bump}
            still={still}
          />
          <EmptyResult shown={asked && returned === null} />
        </div>
      </div>

      <LeakTest
        live={testing}
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
