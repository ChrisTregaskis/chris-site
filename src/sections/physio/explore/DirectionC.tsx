import { motion } from "framer-motion";
import { type CSSProperties, useState } from "react";
import { ExploreShell } from "./ExploreShell";
import {
  HOME_ORG,
  type Org,
  ORG_HEADING,
  ORG_ROWS,
  ORG_STEPS,
  ORG_TINT,
  ORGS,
  otherOrg,
  rowsOf,
} from "./organisations";
import { cn } from "@/lib/cn";
import { Odometer } from "@/ui/organisms/Odometer";
import { DURATION, EASE } from "@/ui/tokens/motion";

/*
 * Direction C, "One table, three layers", with the query on show. The
 * sessions table is three see-through sheets lying exactly on top of each
 * other, one per organisation, under the query that reads it:
 *
 * 1. `select * from sessions` gets every row: one interleaved table.
 * 2. The transaction is stamped with the signed-in organisation; the sheets
 *    pull apart, rising up and back like steps, each organisation's rows
 *    closing up on its own, the signed-in one at the front.
 * 3. The policy slides in as a veil between the front sheet and the rest,
 *    the others sink behind it and the count rolls down to that
 *    organisation's rows. Then the leak test: sign in as any organisation
 *    and try to read another's sessions. The query grows the filter, that
 *    organisation's sheet lunges at the front and falls back behind the
 *    veil (which flashes), and the count reads 0.
 *
 * Real CSS 3D (perspective, preserve-3d), no library. Tilts stay shallow so
 * text on the sheets keeps at least 13px on screen.
 */

type Ask = "every" | "other";

const W = 460;
const HEADER = 42;
const ROW_H = 36;
const PAD = 12;
const FULL_H = HEADER + ORG_ROWS.length * ROW_H + PAD;
/** Room for the stack at its tallest (pulled apart). */
const STACK_H = 410;
/** Where the front sheet sits once apart: at the foot of the stack. */
const FRONT_Y = 205;
/** How far up (and back) each pulled-apart sheet sits from the one in front. */
const STEP_Y = 195;

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
 * Where a sheet sits: `role` 0 is the signed-in organisation's (in front),
 * 1 and 2 the others. Lying as one (1), pulled apart down and back (2),
 * the front one lifted and the rest dropped below the policy (3).
 */
function sheetPose(stage: number, role: number): Pose {
  if (stage === 1) return { y: 0, z: 0, opacity: 1, blur: 0 };
  if (stage === 2) {
    return { y: FRONT_Y - role * STEP_Y, z: -role * 110, opacity: 1, blur: 0 };
  }
  if (role === 0) {
    return { y: FRONT_Y, z: 40, opacity: 1, blur: 0 };
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
  stage: number;
  asking: boolean;
  /** Bumps up against the policy each time this changes (the leak test). */
  bump: number | null;
  still: boolean;
}

/** One organisation's rows on its own see-through sheet. */
function Sheet({ org, role, stage, asking, bump, still }: SheetProps) {
  const apart = stage >= 2;
  const pose = sheetPose(stage, role);
  const mine = ORG_ROWS.map((row, index) => ({ row, index })).filter(
    ({ row }) => row.org === org,
  );
  const height = apart ? HEADER + mine.length * ROW_H + PAD : FULL_H;
  const trying = bump !== null;
  // Asking for someone else's rows: the signed-in sheet's own rows don't match.
  const quiet = asking && role === 0;

  return (
    <div
      className={cn(
        MOVE,
        "absolute left-0 top-0 [transform-style:preserve-3d]",
      )}
      style={{
        ...timing(role),
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
          className={cn(
            MOVE,
            "absolute inset-x-0 top-0 rounded-[14px] bg-raised",
            apart ? "opacity-100" : "opacity-0",
          )}
          style={{
            ...timing(role),
            height,
            boxShadow: edge(org, apart && ((role === 0 && !asking) || trying)),
          }}
        />
        <p
          className={cn(
            MOVE,
            "absolute left-5 top-[11px] m-0 flex items-center gap-2 text-[17px] font-semibold",
            ORG_TINT[org].text,
            apart ? "opacity-100" : "opacity-0",
          )}
          style={timing(role)}
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
              ...timing(role),
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

/** How many rows come back, and why, in one line. */
function readout(
  stage: number,
  who: Org,
  asking: boolean,
): { count: number; reason: string } {
  if (stage === 1) {
    return {
      count: ORG_ROWS.length,
      reason: "Every organisation's sessions, in one table.",
    };
  }
  if (stage === 2) {
    return {
      count: ORG_ROWS.length,
      reason: `Every organisation's rows, for now. The transaction knows it's ${who}.`,
    };
  }
  if (asking) {
    return {
      count: 0,
      reason: `${otherOrg(who)}'s sessions are in the table, but the policy only lets ${who}'s through.`,
    };
  }
  return {
    count: rowsOf(who).length,
    reason: `Only ${who}'s. The query has no organisation filter; the policy did it.`,
  };
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
        width: W + 40,
        height: 400,
        transform: `translate3d(${live ? -20 : -60}px, ${FRONT_Y - 255}px, -40px)`,
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
        "flex min-h-[30px] flex-wrap items-baseline gap-x-5 gap-y-2 text-[15px] transition-opacity duration-slow motion-reduce:transition-none",
        live ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!live}
    >
      <button
        type="button"
        tabIndex={live ? 0 : -1}
        onClick={onTry}
        className="border-0 border-b-2 border-accent bg-transparent p-0 pb-[2px] font-semibold text-accent"
      >
        Try to read {target}&rsquo;s sessions
      </button>
      {asking ? (
        <button
          type="button"
          onClick={onReset}
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
  const [signedIn, setSignedIn] = useState<Org>(HOME_ORG);
  const [ask, setAsk] = useState<Ask>("every");
  const [attempt, setAttempt] = useState(0);
  const named = stage >= 2;
  const live = stage >= 3;
  const who = live ? signedIn : HOME_ORG;
  const target = otherOrg(who);
  const asking = live && ask === "other";
  const { count, reason } = readout(stage, who, asking);
  // Front to back: the signed-in organisation first, then the rest in order.
  const order = [who, ...ORGS.filter((o) => o !== who)];

  return (
    <figure
      className="m-0 w-full max-w-[560px]"
      aria-label="A query against one sessions table holding every organisation's rows, drawn as one see-through sheet per organisation"
    >
      <SignedInPicker
        named={named}
        live={live}
        who={who}
        onPick={(org) => {
          setSignedIn(org);
          setAsk("every");
        }}
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
        >
          <span className="text-muted">where</span> organisation_id ={" "}
          <span className={ORG_TINT[target].text}>&lsquo;{target}&rsquo;</span>
        </p>
      </div>

      {/* What comes back: the count, tied to the sheet in front. */}
      <div className="mt-2 flex items-end gap-3">
        <Odometer
          value={count}
          reducedMotion={still}
          className="h-[44px] w-[1.2ch] font-display text-[44px] font-light leading-none text-ink"
          renderItem={(n) => n}
        />
        <span className="pb-[4px] text-[15px] text-muted">
          {count === 1 ? "row" : "rows"} back
        </span>
      </div>
      <p
        className="m-0 mt-1 min-h-[2.8em] max-w-[34em] text-[15px] text-ink"
        aria-live="polite"
      >
        <span className="sr-only">{count} rows back. </span>
        {reason}
      </p>

      {/* The table: one see-through sheet per organisation. */}
      <div
        aria-hidden="true"
        className="relative mt-2 [perspective:1800px] [perspective-origin:50%_100%]"
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
          {ORGS.map((org) => (
            <Sheet
              key={org}
              org={org}
              role={order.indexOf(org)}
              stage={stage}
              asking={asking}
              bump={asking && org === target ? attempt : null}
              still={still}
            />
          ))}
          <PolicyPlane live={live} pulse={asking ? attempt : 0} still={still} />
        </div>
      </div>

      <LeakTest
        live={live}
        target={target}
        asking={asking}
        onTry={() => {
          setAsk("other");
          setAttempt((n) => n + 1);
        }}
        onReset={() => setAsk("every")}
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
