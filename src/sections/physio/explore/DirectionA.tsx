import { type CSSProperties } from "react";
import { ExploreShell } from "./ExploreShell";
import { HOME, type Practice, PRACTICES, ROWS, TINT } from "./practices";
import { cn } from "@/lib/cn";

/*
 * Direction A, "Down the stack": a cross-section of the system, read top to
 * bottom like a section drawing with its levels marked in the margin. Three
 * practices' requests run into one app and down to one table (1);
 * Riverside's request carries its practice down and the connection is
 * stamped with it (2); the policy line inside Postgres closes under the
 * request, and an unfiltered query still gets only Riverside's rows back
 * up (3). What it adds over the list: where the practice is set, and that
 * the filter sits inside the database, below every line of app code.
 */

const W = 560;
const TRUNK = 236;
const NOTE_X = TRUNK + 62;
const TOP = 34;
const APP_Y = 168;
const CONN_Y = 268;
const POLICY_Y = 360;
const TABLE_Y = 400;
const ROW_H = 31;

const PRACTICE_X: Record<Practice, number> = {
  Riverside: 92,
  Harbour: 300,
  Moorland: 470,
};

const T =
  "transition-[opacity,transform,fill,stroke] ease-enter motion-reduce:transition-none";

/** A choreographed CSS transition, timed from the motion tokens. */
const timed = (on: boolean, delay?: string): CSSProperties => ({
  transitionDuration: "var(--duration-together)",
  transitionDelay: on ? delay : undefined,
});

/** The line from a practice's name down into the app's trunk. */
function feedPath(practice: Practice): string {
  const x = PRACTICE_X[practice];
  const y = TOP + 22;
  return `M ${x} ${y} C ${x} ${y + 60}, ${TRUNK} ${APP_Y - 70}, ${TRUNK} ${APP_Y}`;
}

interface LevelProps {
  y: number;
  n?: number;
  lines: string[];
  lit: boolean;
  /** Draw the level right across (the policy), not just to the trunk. */
  across?: boolean;
  closed?: boolean;
}

/** One level of the section: its mark in the margin, its step number, its name. */
function Level({ y, n, lines, lit, across, closed }: LevelProps) {
  return (
    <g>
      <line
        x1={24}
        x2={across ? W - 24 : TRUNK}
        y1={y}
        y2={y}
        strokeWidth={closed ? 2 : 1}
        strokeDasharray={across && !closed ? "3 6" : undefined}
        className={cn(T, closed ? "stroke-accent" : "stroke-line-strong")}
        style={timed(closed ?? false)}
      />
      {n ? (
        <text
          x={24}
          y={y - 12}
          className={cn(
            T,
            "fill-accent font-display text-[24px] font-light",
            lit ? "opacity-100" : "opacity-0",
          )}
          style={timed(lit)}
        >
          {n}
        </text>
      ) : null}
      <text
        x={n ? 46 : 24}
        y={y - 13 - (lines.length - 1) * 17}
        className={cn(T, "text-[13px]", lit ? "fill-ink" : "fill-muted")}
      >
        {lines.map((line, index) => (
          <tspan key={line} x={n ? 46 : 24} dy={index ? 17 : 0}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

interface NoteProps {
  y: number;
  on: boolean;
  delay?: string;
  tone?: "accent" | "ink" | "muted";
  children: string;
}

/** A note to the right of the trunk, written in as its step arrives. */
function Note({ y, on, delay, tone = "accent", children }: NoteProps) {
  return (
    <text
      x={NOTE_X}
      y={y}
      className={cn(
        T,
        "text-[14px]",
        tone === "accent" && "fill-accent font-medium",
        tone === "ink" && "fill-ink font-medium",
        tone === "muted" && "fill-muted",
        on ? "opacity-100" : "opacity-0",
      )}
      style={timed(on, delay)}
    >
      {children}
    </text>
  );
}

function Figure({ stage }: { stage: number }) {
  const named = stage >= 2;
  const closed = stage >= 3;
  const homeCount = ROWS.filter((row) => row.practice === HOME).length;
  const h = TABLE_Y + 30 + ROWS.length * ROW_H + 8;
  // Where the request has got to: the app (1), the connection (2), the policy (3).
  const capsuleY = closed ? POLICY_Y : named ? CONN_Y : APP_Y;

  return (
    <figure
      className="m-0 w-full max-w-[560px]"
      aria-label="A cross-section of the stack: three practices' requests run through one app into one sessions table, and a policy inside Postgres lets only the signed-in practice's rows back up"
    >
      <svg viewBox={`0 0 ${W} ${h}`} className="block w-full font-body">
        {/* The three practices, and their requests running into one app. */}
        {PRACTICES.map((practice) => {
          const away = named && practice !== HOME;
          const x = PRACTICE_X[practice];
          return (
            <g
              key={practice}
              className={cn(T, away ? "opacity-25" : "opacity-100")}
              style={timed(away)}
            >
              <text
                x={x}
                y={TOP}
                textAnchor="middle"
                className="fill-ink text-[15px] font-medium"
              >
                {practice}
              </text>
              <circle
                cx={x}
                cy={TOP + 18}
                r={4.5}
                className={TINT[practice].fill}
              />
              <path
                d={feedPath(practice)}
                fill="none"
                strokeWidth={1.5}
                className={cn(TINT[practice].stroke, "opacity-70")}
              />
            </g>
          );
        })}

        {/* The trunk: one app, one connection, one database. */}
        <line
          x1={TRUNK}
          x2={TRUNK}
          y1={APP_Y}
          y2={TABLE_Y}
          strokeWidth={1.5}
          className="stroke-line-strong"
        />

        <Level y={APP_Y} lines={["App", "one codebase"]} lit={false} />
        <Level y={CONN_Y} n={2} lines={["Connection"]} lit={stage === 2} />
        <Level
          y={POLICY_Y}
          n={3}
          lines={["Row-level security", "inside Postgres"]}
          lit={stage === 3}
          across
          closed={closed}
        />

        <Note y={CONN_Y + 5} on={named} delay="var(--duration-slow)">
          {`current practice: ${HOME}`}
        </Note>
        <Note y={POLICY_Y + 26} on={closed} delay="var(--duration-slow)">
          policy: tenant_id = current practice
        </Note>
        <Note
          y={APP_Y + 30}
          on={closed}
          delay="var(--duration-apart)"
          tone="muted"
        >
          a query with no practice filter
        </Note>
        <Note
          y={APP_Y + 50}
          on={closed}
          delay="var(--duration-apart)"
          tone="ink"
        >
          {`still gets only ${HOME}'s ${homeCount}`}
        </Note>

        {/* What comes back up, past the policy. */}
        <g
          className={cn(T, closed ? "opacity-100" : "opacity-0")}
          style={timed(closed, "var(--duration-flash)")}
        >
          <line
            x1={TRUNK + 22}
            x2={TRUNK + 22}
            y1={TABLE_Y + 6}
            y2={APP_Y + 12}
            strokeWidth={1.5}
            strokeDasharray="2 5"
            className="stroke-accent"
          />
          <path
            d={`M ${TRUNK + 17} ${APP_Y + 19} L ${TRUNK + 22} ${APP_Y + 12} L ${TRUNK + 27} ${APP_Y + 19}`}
            fill="none"
            strokeWidth={1.5}
            className="stroke-accent"
          />
        </g>

        {/* The request on its way down, carrying its practice. */}
        <g
          className={cn(T, named ? "opacity-100" : "opacity-0")}
          style={{ ...timed(named), transform: `translateY(${capsuleY}px)` }}
        >
          <rect
            x={TRUNK - 44}
            y={-13}
            width={88}
            height={26}
            rx={13}
            className="fill-accent"
          />
          <text
            x={TRUNK}
            y={5}
            textAnchor="middle"
            className="fill-on-accent text-[13px] font-semibold"
          >
            {HOME}
          </text>
        </g>

        {/* The one table every practice's sessions live in. */}
        <text
          x={24}
          y={TABLE_Y + 20}
          className={cn(
            T,
            "text-[13px]",
            stage === 1 ? "fill-ink" : "fill-muted",
          )}
        >
          <tspan
            className={cn(
              T,
              "fill-accent font-display text-[24px] font-light",
              stage === 1 ? "opacity-100" : "opacity-0",
            )}
          >
            1
          </tspan>
          <tspan x={46}>sessions: one table, every practice</tspan>
        </text>
        {ROWS.map((row, index) => {
          const y = TABLE_Y + 30 + index * ROW_H;
          const blocked = closed && row.practice !== HOME;
          return (
            <g
              key={row.label}
              className={cn(T, blocked ? "opacity-20" : "opacity-100")}
              style={timed(blocked)}
            >
              <rect
                x={24}
                y={y}
                width={W - 48}
                height={ROW_H - 5}
                rx={4}
                className="fill-raised/40"
              />
              <circle
                cx={42}
                cy={y + 13}
                r={4.5}
                className={TINT[row.practice].fill}
              />
              <text x={58} y={y + 18} className="fill-ink text-[14px]">
                {row.label}
              </text>
              <text
                x={W - 38}
                y={y + 18}
                textAnchor="end"
                className="fill-muted text-[12px]"
              >
                {row.practice}
                {blocked ? ", held back" : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function DirectionA() {
  return <ExploreShell renderStage={(stage) => <Figure stage={stage} />} />;
}
