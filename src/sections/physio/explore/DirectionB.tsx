import { motion } from "framer-motion";
import { useState } from "react";
import { ExploreShell } from "./ExploreShell";
import {
  HOME,
  type Practice,
  PRACTICES,
  ROWS,
  type SessionRow,
  TINT,
} from "./practices";
import { cn } from "@/lib/cn";
import { Odometer } from "@/ui/organisms/Odometer";
import { DURATION, EASE } from "@/ui/tokens/motion";

/*
 * Direction B, "Try to leak it": the query is the figure, set large in the
 * display face rather than as a code block, with what it gets back beneath
 * it and the database's edge (the policy) under that. 1: a bare query gets
 * every practice's rows. 2: the connection is stamped with the practice.
 * 3: the policy closes and other practices' rows sink back below it; then
 * the visitor can sign in as any practice and try to read another's
 * sessions: those rows rise towards the line and dissolve into it, and the
 * count reads 0. What it adds over the list: the claim is something you
 * can poke, and the missed filter is shown, not described.
 */

type Ask = "every" | "other";

const ROW_H = 36;
const HELD_H = 28;
/** Where the policy line sits: under the most rows one practice has. */
const LINE_Y = 3 * ROW_H + 14;
const AREA_H = Math.max(ROWS.length * ROW_H, LINE_Y + 40 + 4 * HELD_H);

interface Placed {
  row: SessionRow;
  top: number;
  side: "got" | "held";
}

/**
 * Where each row sits: all in table order before the policy (`who` null);
 * then the practice's own rows above the line and the rest held below it.
 */
function place(who: Practice | null): Placed[] {
  if (!who) {
    return ROWS.map((row, index) => ({ row, top: index * ROW_H, side: "got" }));
  }
  let got = 0;
  let held = 0;
  return ROWS.map((row) =>
    row.practice === who
      ? { row, top: got++ * ROW_H, side: "got" }
      : { row, top: LINE_Y + 40 + held++ * HELD_H, side: "held" },
  );
}

function otherThan(practice: Practice): Practice {
  return PRACTICES.find((p) => p !== practice) ?? HOME;
}

/** How many rows come back, and why, in plain words. */
function readout(
  stage: number,
  who: Practice,
  asking: boolean,
): { count: number; reason: string } {
  if (stage < 3) {
    return {
      count: ROWS.length,
      reason:
        stage === 2
          ? `Every practice's rows, for now. The connection knows it's ${who}.`
          : "Every practice's sessions, in one table.",
    };
  }
  if (asking) {
    return {
      count: 0,
      reason: `${otherThan(who)}'s sessions are in the table, but the policy only lets ${who}'s through.`,
    };
  }
  return {
    count: ROWS.filter((row) => row.practice === who).length,
    reason: `Only ${who}'s. The query has no practice filter; the policy did it.`,
  };
}

/** Held rows sit back; asked-for ones come forward to try the line. */
function rowOpacity(held: boolean, asking: boolean, bump: boolean): number {
  if (bump) return 0.8;
  if (held) return 0.4;
  return asking ? 0.55 : 1;
}

interface FigureProps {
  stage: number;
  still: boolean;
}

function Figure({ stage, still }: FigureProps) {
  const [signedIn, setSignedIn] = useState<Practice>(HOME);
  const [ask, setAsk] = useState<Ask>("every");
  const [attempt, setAttempt] = useState(0);
  const live = stage >= 3;
  const who = live ? signedIn : HOME;
  const target = otherThan(who);
  const asking = live && ask === "other";
  const placed = place(live ? who : null);
  const { count, reason } = readout(stage, who, asking);
  const swift = still ? 0 : DURATION.slow;

  return (
    <figure
      className="m-0 w-full max-w-[540px]"
      aria-label="A query against the shared sessions table, and what it gets back"
    >
      {/* The connection, stamped with the request's practice. */}
      <p
        className={cn(
          "m-0 text-[15px] text-accent transition-opacity duration-slow ease-enter motion-reduce:transition-none",
          stage >= 2 ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="text-muted">on this connection, </span>
        current practice = {who}
      </p>

      {/* The query, set as type. */}
      <p className="m-0 mt-3 font-display text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.15] tracking-[-0.02em]">
        <span className="text-muted">select</span> *{" "}
        <span className="text-muted">from</span> sessions
        <span
          className={cn(
            "block overflow-hidden transition-[max-height,opacity] duration-slow ease-enter motion-reduce:transition-none",
            asking ? "max-h-[2em] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <span className="text-muted">where</span> tenant_id ={" "}
          <span className={TINT[target].text}>&lsquo;{target}&rsquo;</span>
        </span>
      </p>

      {/* What comes back. */}
      <div className="mt-6 flex items-end gap-3">
        <Odometer
          value={count}
          reducedMotion={still}
          className="h-[44px] w-[1.2ch] font-display text-[44px] font-light leading-none text-ink"
          renderItem={(n) => n}
        />
        <span className="pb-[4px] text-[15px] text-muted">
          {count === 1 ? "row" : "rows"} back
          <span className="sr-only">: {count}</span>
        </span>
      </div>
      <p
        className="m-0 mt-1 min-h-[3em] max-w-[34em] text-[15px] text-ink"
        aria-live="polite"
      >
        {reason}
      </p>

      {/*
       * One list, two sides of the policy: what the query gets above the
       * line, what Postgres holds back below it.
       */}
      <div className="relative mt-3" style={{ height: AREA_H }}>
        <motion.div
          key={`line-${attempt}`}
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 h-[2px] origin-left bg-accent transition-transform duration-slow ease-enter motion-reduce:transition-none",
            live ? "scale-x-100" : "scale-x-0",
          )}
          style={{ top: LINE_Y }}
          animate={
            asking && attempt > 0 && !still ? { scaleY: [1, 3, 1] } : undefined
          }
          transition={{ duration: DURATION.flash, delay: 0.25 }}
        />
        <p
          className={cn(
            "absolute left-0 m-0 text-[14px] font-medium text-accent transition-opacity duration-slow ease-enter motion-reduce:transition-none",
            live ? "opacity-100" : "opacity-0",
          )}
          style={{ top: LINE_Y + 8 }}
        >
          policy: tenant_id = current practice
        </p>
        <ul className="m-0 list-none p-0">
          {placed.map(({ row, top, side }) => {
            const held = side === "held";
            const bump = held && asking && row.practice === target;
            return (
              <motion.li
                key={row.label}
                initial={false}
                animate={{ top, opacity: rowOpacity(held, asking, bump) }}
                transition={{ duration: swift, ease: [...EASE.enter] }}
                className="absolute inset-x-0 grid grid-cols-[12px_1fr_auto] items-center gap-[10px]"
                style={{ height: held ? HELD_H : ROW_H }}
              >
                <i
                  aria-hidden="true"
                  className={cn(
                    "size-[10px] rounded-pill",
                    TINT[row.practice].bg,
                  )}
                />
                <motion.span
                  key={bump ? attempt : "rest"}
                  className={cn(held ? "text-[15px]" : "text-[17px]")}
                  animate={
                    bump && attempt > 0 && !still
                      ? { y: [0, -18, 0, -8, 0] }
                      : undefined
                  }
                  transition={{ duration: DURATION.slow, ease: [...EASE.lift] }}
                >
                  {row.label}
                </motion.span>
                <small className="text-[12px] text-muted">
                  {row.practice}
                  {held ? ", held back" : ""}
                </small>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Poke it: sign in as any practice, and ask for someone else's sessions. */}
      <div
        className={cn(
          "mt-6 grid gap-3 text-[15px] transition-opacity duration-slow ease-enter motion-reduce:transition-none",
          live ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!live}
      >
        <div
          role="group"
          aria-label="Signed in as"
          className="flex flex-wrap items-baseline gap-x-5 gap-y-2"
        >
          <span className="text-muted">Signed in as</span>
          {PRACTICES.map((practice) => (
            <button
              key={practice}
              type="button"
              tabIndex={live ? 0 : -1}
              aria-pressed={signedIn === practice}
              onClick={() => {
                setSignedIn(practice);
                setAsk("every");
              }}
              className={cn(
                "flex items-center gap-2 border-0 border-b-2 border-transparent bg-transparent p-0 pb-[2px] font-medium text-muted transition-colors duration-base hover:text-ink motion-reduce:transition-none",
                signedIn === practice && "border-current text-ink",
              )}
            >
              <i
                aria-hidden="true"
                className={cn("size-[8px] rounded-pill", TINT[practice].bg)}
              />
              {practice}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <button
            type="button"
            tabIndex={live ? 0 : -1}
            onClick={() => {
              setAsk("other");
              setAttempt((n) => n + 1);
            }}
            className="border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent"
          >
            Try to read {target}&rsquo;s sessions
          </button>
          {asking ? (
            <button
              type="button"
              onClick={() => setAsk("every")}
              className="border-0 bg-transparent p-0 text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Ask for every session again
            </button>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

export function DirectionB() {
  return (
    <ExploreShell
      renderStage={(stage, still) => <Figure stage={stage} still={still} />}
    />
  );
}
