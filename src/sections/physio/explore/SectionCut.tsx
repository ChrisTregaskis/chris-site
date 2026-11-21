import { motion, type Variants } from "framer-motion";
import { useId } from "react";
import {
  type ArchFigureProps,
  draw,
  drawIn,
  fade,
  GlyphPaths,
  lit,
  Marker,
} from "./archKit";
import { cn } from "@/lib/cn";

/*
 * Direction B: the platform as a cutaway section through the ground, drawn
 * side-on the way an architect draws one. The visitor and the admin stand on
 * the surface; the API and the CDN are the only doors there; underground the
 * private network is a bunker with hatched walls (a section's cut material),
 * reached only down the API's pipe, its only other openings the private
 * endpoints through its side wall to sign-in and video storage, and one pipe
 * capped under the ceiling where a way out would be. The functions are cells,
 * each holding only its own key (or none); Postgres is the tank at the
 * bottom, inside its policy; the admin comes down a shaft outside and in
 * through a side door. No depth, no pieces: nothing like Wayfinder's board.
 */

const W = 400;
const H = 484;

const G = 132;
const WALL = 12;
const OUT = { l: 48, t: 168, r: 284, b: 466 };
const IN = {
  l: OUT.l + WALL,
  t: OUT.t + WALL,
  r: OUT.r - WALL,
  b: OUT.b - WALL,
};
const WALL_X = (OUT.l + IN.l) / 2;
const SIDE_WALL_X = (OUT.r + IN.r) / 2;
const CEILING_Y = (OUT.t + IN.t) / 2;

const API_X = 156;
const CDN_X = 338;
const VISITOR_X = 247;
const ADMIN_X = 26;

const CELL = { w: 40, h: 36, y: 222, xs: [104, 156, 208] };
const CELL_BOTTOM = CELL.y + CELL.h;
const TANK = { x: 156, top: 342, bottom: 392, rx: 44, ry: 9 };
const POLICY = { x: 102, y: 322, w: 108, h: 90 };
const STORE = { x: CDN_X, top: 224, bottom: 256, rx: 26, ry: 7 };
const SIGN_IN = { x: CDN_X - 28, y: 330, w: 56, h: 30 };
const PIPE_STORE_Y = 234;
const PIPE_SIGN_FROM = 249;
const PIPE_SIGN_Y = SIGN_IN.y + SIGN_IN.h / 2;
const ADMIN_Y = 384;

const LABEL = "fill-ink font-body text-[17px] font-semibold";
const NOTE = "fill-muted font-body text-[15px]";
const SOLID = "fill-[rgb(var(--color-tone-physio))] stroke-ink";

/** A pipe: a stroke in its colour, hollowed by the ground's tone. */
function Pipe({
  d,
  colour,
  variants,
}: {
  d: string;
  colour: string;
  variants: Variants;
}) {
  const caps = {
    fill: "none",
    strokeLinecap: "butt",
    strokeLinejoin: "round",
  } as const;
  return (
    <g>
      <motion.path
        variants={variants}
        d={d}
        className={colour}
        strokeWidth={9}
        {...caps}
      />
      <motion.path
        variants={variants}
        d={d}
        className="stroke-[rgb(var(--color-tone-physio))]"
        strokeWidth={3.5}
        {...caps}
      />
    </g>
  );
}

/** A person standing on the surface, for scale. */
function Person({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={G - 33} r={5.5} className="fill-ink" />
      <path
        d={`M${x - 8} ${G} V${G - 17} Q${x - 8} ${G - 25} ${x} ${G - 25} Q${x + 8} ${G - 25} ${x + 8} ${G - 17} V${G} Z`}
        className="fill-ink"
      />
      <text x={x} y={G - 50} textAnchor="middle" className={LABEL}>
        {label}
      </text>
    </g>
  );
}

/** A door on the surface: a kiosk standing on the ground line. */
function Kiosk({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <path
        d={`M${x - 28} ${G} V${G - 30} Q${x - 28} ${G - 38} ${x - 20} ${G - 38} H${x + 20} Q${x + 28} ${G - 38} ${x + 28} ${G - 30} V${G}`}
        className={SOLID}
        strokeWidth={2}
      />
      <text x={x} y={G - 13} textAnchor="middle" className={LABEL}>
        {label}
      </text>
    </g>
  );
}

/** A tank in profile: a body and an elliptical lid. */
function Tank({
  x,
  top,
  bottom,
  rx,
  ry,
}: {
  x: number;
  top: number;
  bottom: number;
  rx: number;
  ry: number;
}) {
  return (
    <g className={SOLID} strokeWidth={2}>
      <path
        d={`M${x - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${x + rx} ${bottom} V${top}`}
      />
      <ellipse cx={x} cy={top} rx={rx} ry={ry} />
    </g>
  );
}

export function SectionCut({ active, still }: ArchFigureProps) {
  const hatch = `arch-hatch-${useId().replace(/:/g, "")}`;
  const keyAt = (x: number) => (
    <g
      transform={`translate(${x - 11} ${CELL.y + CELL.h / 2 - 11}) scale(${22 / 24})`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <GlyphPaths id="keys" />
    </g>
  );
  return (
    <motion.svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby="arch-b-title"
      className="block h-auto w-full"
      {...drawIn(still)}
    >
      <title id="arch-b-title">
        A cutaway section of the platform: the visitor and the admin on the
        surface beside its two doors, the API and the CDN. Underground, the
        functions sit in a sealed bunker, the private network, reached only down
        the API&apos;s pipe; its only other openings are private endpoints to
        sign-in and video storage, and the pipe where a way out would be is
        capped. Each function holds only its own key, or none. Postgres is the
        tank at the bottom, inside its policy, and the admin reaches it read
        only, down a shaft and through a side door.
      </title>
      <defs>
        <pattern
          id={hatch}
          width={7}
          height={7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={7}
            className="stroke-line-strong"
            strokeWidth={2.2}
          />
        </pattern>
      </defs>

      {/* The ground: a line with the section's hatched fringe under it */}
      <motion.g variants={fade(0)}>
        <rect
          x={0}
          y={G}
          width={W}
          height={9}
          fill={`url(#${hatch})`}
          opacity={0.7}
        />
        <line
          x1={0}
          x2={W}
          y1={G}
          y2={G}
          className="stroke-line-strong"
          strokeWidth={2}
        />
        <text x={W - 4} y={22} textAnchor="end" className={NOTE}>
          The internet
        </text>
      </motion.g>

      {/* The bunker: hatched walls, a tinted inside, one opening under the API */}
      <motion.g variants={fade(0.15)}>
        <rect
          x={IN.l}
          y={IN.t}
          width={IN.r - IN.l}
          height={IN.b - IN.t}
          className="fill-tenant-teal/[0.09]"
        />
        <path
          d={`M${OUT.l} ${OUT.t} H${OUT.r} V${OUT.b} H${OUT.l} Z M${IN.l} ${IN.t} V${IN.b} H${IN.r} V${IN.t} Z`}
          fillRule="evenodd"
          fill={`url(#${hatch})`}
        />
        <text x={IN.r - 10} y={IN.b - 12} textAnchor="end" className={NOTE}>
          Private network
        </text>
      </motion.g>

      {/* Pipes */}
      <Pipe
        d={`M${API_X} ${G} V${CELL.y}`}
        colour="stroke-accent"
        variants={draw(0.15)}
      />
      <Pipe
        d={`M${API_X} ${CELL_BOTTOM} V${TANK.top - TANK.ry}`}
        colour="stroke-accent"
        variants={draw(0.45)}
      />
      <Pipe
        d={`M${CDN_X} ${G} V${STORE.top - STORE.ry}`}
        colour="stroke-tenant-teal"
        variants={draw(0.3)}
      />
      <Pipe
        d={`M${CELL.xs[2] + CELL.w / 2} ${PIPE_STORE_Y} H${STORE.x - STORE.rx}`}
        colour="stroke-line-strong"
        variants={draw(0.6)}
      />
      <Pipe
        d={`M${CELL.xs[2] + CELL.w / 2} ${PIPE_SIGN_FROM} H${CELL.xs[2] + CELL.w / 2 + 18} V${PIPE_SIGN_Y} H${SIGN_IN.x}`}
        colour="stroke-line-strong"
        variants={draw(0.7)}
      />
      {/* The way out that isn't there: a pipe capped under the ceiling */}
      <motion.g variants={fade(0.9)} className={lit(active, "out")}>
        <path
          d={`M${CELL.xs[0]} ${CELL.y} V${IN.t + 14}`}
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="2 5"
          strokeLinecap="round"
        />
        <path
          d={`M${CELL.xs[0] - 9} ${IN.t + 12} H${CELL.xs[0] + 9}`}
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </motion.g>

      {/* The admin's shaft: down outside the bunker, in at a side door */}
      <motion.path
        variants={fade(1.1)}
        d={`M${ADMIN_X} ${G + 12} V${ADMIN_Y} H${POLICY.x}`}
        className={lit(active, "admin")}
        stroke="currentColor"
        fill="none"
        strokeWidth={2.5}
        strokeDasharray="7 6"
        strokeLinecap="round"
      />

      <motion.g variants={fade(0.8)}>
        {/* Endpoints: flanges where the pipes pass the side wall */}
        <g className={lit(active, "out")}>
          {[PIPE_STORE_Y, PIPE_SIGN_Y].map((y) => (
            <rect
              key={y}
              x={SIDE_WALL_X - 5}
              y={y - 10}
              width={10}
              height={20}
              rx={3}
              className="fill-[rgb(var(--color-tone-physio))]"
              stroke="currentColor"
              strokeWidth={2}
            />
          ))}
        </g>

        <Person x={VISITOR_X} label="Visitor" />
        <Person x={ADMIN_X} label="Admin" />
        <rect
          x={ADMIN_X - 11}
          y={G - 3}
          width={22}
          height={6}
          rx={2}
          className="fill-line-strong"
        />
        <Kiosk x={API_X} label="API" />
        <Kiosk x={CDN_X} label="CDN" />

        {/* The functions: cells, each with only its own key, or none */}
        <text x={API_X + 16} y={CELL.y - 12} className={LABEL}>
          Functions
        </text>
        {CELL.xs.map((x) => (
          <rect
            key={x}
            x={x - CELL.w / 2}
            y={CELL.y}
            width={CELL.w}
            height={CELL.h}
            rx={6}
            className={SOLID}
            strokeWidth={2}
          />
        ))}
        <g data-marker="keys" className={lit(active, "keys")}>
          {keyAt(CELL.xs[0])}
          {keyAt(CELL.xs[1])}
        </g>

        {/* Postgres in its policy */}
        <rect
          x={POLICY.x}
          y={POLICY.y}
          width={POLICY.w}
          height={POLICY.h}
          rx={14}
          className={cn(lit(active, "role"), "fill-none")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <Tank {...TANK} />
        <text
          x={TANK.x}
          y={TANK.bottom - 14}
          textAnchor="middle"
          className={LABEL}
        >
          Postgres
        </text>

        {/* Outside the bunker: video storage and sign-in */}
        <Tank
          x={STORE.x}
          top={STORE.top}
          bottom={STORE.bottom}
          rx={STORE.rx}
          ry={STORE.ry}
        />
        <text
          x={STORE.x}
          y={STORE.bottom + 30}
          textAnchor="middle"
          className={LABEL}
        >
          Video
        </text>
        <text
          x={STORE.x}
          y={STORE.bottom + 49}
          textAnchor="middle"
          className={LABEL}
        >
          storage
        </text>
        <rect
          x={SIGN_IN.x}
          y={SIGN_IN.y}
          width={SIGN_IN.w}
          height={SIGN_IN.h}
          rx={6}
          className={SOLID}
          strokeWidth={2}
        />
        <text
          x={STORE.x}
          y={SIGN_IN.y + SIGN_IN.h + 24}
          textAnchor="middle"
          className={LABEL}
        >
          Sign-in
        </text>

        <text
          x={ADMIN_X - 9}
          y={(G + ADMIN_Y) / 2 + 40}
          textAnchor="middle"
          transform={`rotate(-90 ${ADMIN_X - 9} ${(G + ADMIN_Y) / 2 + 40})`}
          className={NOTE}
        >
          read only
        </text>

        <Marker id="out" x={CELL.xs[0]} y={CEILING_Y} active={active} />
        <Marker
          id="role"
          x={POLICY.x + POLICY.w}
          y={POLICY.y}
          active={active}
        />
        <Marker id="admin" x={WALL_X} y={ADMIN_Y} active={active} />
      </motion.g>
    </motion.svg>
  );
}
