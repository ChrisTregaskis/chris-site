import { motion } from "framer-motion";
import {
  type ArchFigureProps,
  draw,
  drawIn,
  fade,
  lit,
  Marker,
} from "./archKit";
import { cn } from "@/lib/cn";

/*
 * Direction A: the platform as a transit map. A request rides the lilac line
 * from the visitor to Postgres; video rides the teal one through the CDN;
 * the functions' two branches leave the private network's zone only through
 * its endpoints; the line out of the zone stops dead at its edge; the
 * admin's dashed line comes in to Postgres alone. Plan-space, flat, no
 * depth: deliberately nothing like Wayfinder's exploded board.
 */

const W = 380;
const H = 468;

/** The private network: a fare-zone tint. */
const ZONE = { x: 14, y: 150, w: 222, h: 298 };
const EDGE = ZONE.x + ZONE.w;

const MAIN_X = 150;
const SIDE_X = 300;
const Y = {
  visitor: 26,
  api: 100,
  functions: 236,
  signIn: 290,
  postgres: 380,
};

const LABEL = "fill-ink font-body text-[17px] font-semibold";
const NOTE = "fill-muted font-body text-[15px]";

function Station({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      className="fill-[rgb(var(--color-tone-physio))] stroke-ink"
      strokeWidth={3}
    />
  );
}

export function RouteMap({ active, still }: ArchFigureProps) {
  const lineCaps = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <motion.svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby="arch-a-title"
      className="block h-auto w-full"
      {...drawIn(still)}
    >
      <title id="arch-a-title">
        A transit map of the platform: a request runs from the visitor through
        the API to the functions and on to Postgres; video runs from the visitor
        through the CDN to video storage. The functions sit in a private network
        whose only exits are private endpoints to sign-in and video storage, and
        an admin's read-only line runs into Postgres.
      </title>

      {/* The zone */}
      <motion.g variants={fade(0)}>
        <rect
          x={ZONE.x}
          y={ZONE.y}
          width={ZONE.w}
          height={ZONE.h}
          rx={18}
          className="fill-tenant-teal/[0.09]"
        />
        <text x={ZONE.x + 16} y={ZONE.y + ZONE.h - 18} className={NOTE}>
          Private network
        </text>
      </motion.g>

      {/* The line out that isn't there: it stops dead at the zone's edge. */}
      <motion.path
        variants={fade(0.9)}
        d={`M${MAIN_X} ${Y.functions} H${ZONE.x + 12}`}
        className={lit(active, "out")}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="2 6"
        {...lineCaps}
      />

      {/* Video: visitor, CDN, storage */}
      <motion.path
        variants={draw(0.35)}
        d={`M${MAIN_X} ${Y.visitor} H${SIDE_X - 22} A22 22 0 0 1 ${SIDE_X} ${Y.visitor + 22} V${Y.functions}`}
        className="stroke-tenant-teal"
        strokeWidth={7}
        {...lineCaps}
      />

      {/* The functions' two branches, out through private endpoints */}
      <motion.path
        variants={draw(0.6)}
        d={`M${MAIN_X} ${Y.functions} H${SIDE_X}`}
        className="stroke-line-strong"
        strokeWidth={4}
        {...lineCaps}
      />
      <motion.path
        variants={draw(0.7)}
        d={`M${MAIN_X} ${Y.functions} l${Y.signIn - Y.functions} ${Y.signIn - Y.functions} H${SIDE_X}`}
        className="stroke-line-strong"
        strokeWidth={4}
        {...lineCaps}
      />

      {/* A request: visitor, API, functions, Postgres */}
      <motion.path
        variants={draw(0.1)}
        d={`M${MAIN_X} ${Y.visitor} V${Y.postgres}`}
        className="stroke-accent"
        strokeWidth={7}
        {...lineCaps}
      />

      {/* The admin's line: dashed, read only */}
      <motion.path
        variants={fade(1.1)}
        d={`M${SIDE_X} ${Y.postgres} H${MAIN_X + 18}`}
        className={lit(active, "admin")}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="7 6"
        {...lineCaps}
      />

      {/* Stations, labels and markers */}
      <motion.g variants={fade(0.8)}>
        {/* Private endpoints: where the branches cross the zone's edge */}
        <g className={lit(active, "out")}>
          {[Y.functions, Y.signIn].map((y) => (
            <rect
              key={y}
              x={EDGE - 5}
              y={y - 9}
              width={10}
              height={18}
              rx={5}
              className="fill-[rgb(var(--color-tone-physio))]"
              stroke="currentColor"
              strokeWidth={2}
            />
          ))}
        </g>

        <circle cx={MAIN_X} cy={Y.visitor} r={9} className="fill-ink" />
        <Station x={MAIN_X} y={Y.api} />
        <Station x={SIDE_X} y={Y.api} />
        <Station x={MAIN_X} y={Y.functions} r={10} />
        <Station x={SIDE_X} y={Y.functions} r={9} />
        <Station x={SIDE_X} y={Y.signIn} />
        <Station x={SIDE_X} y={Y.postgres} />

        {/* Postgres: the terminus, ringed by its policy */}
        <circle
          cx={MAIN_X}
          cy={Y.postgres}
          r={19}
          className={cn(lit(active, "role"), "fill-none")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <circle cx={MAIN_X} cy={Y.postgres} r={11} className="fill-ink" />

        <text
          x={MAIN_X - 20}
          y={Y.visitor + 6}
          textAnchor="end"
          className={LABEL}
        >
          Visitor
        </text>
        <text x={MAIN_X - 18} y={Y.api + 6} textAnchor="end" className={LABEL}>
          API
        </text>
        <text
          x={MAIN_X - 18}
          y={Y.functions - 14}
          textAnchor="end"
          className={LABEL}
        >
          Functions
        </text>
        <text
          x={MAIN_X - 28}
          y={Y.postgres + 6}
          textAnchor="end"
          className={LABEL}
        >
          Postgres
        </text>
        <text x={SIDE_X + 18} y={Y.api + 6} className={LABEL}>
          CDN
        </text>
        <text x={SIDE_X + 18} y={Y.functions - 2} className={LABEL}>
          Video
        </text>
        <text x={SIDE_X + 18} y={Y.functions + 17} className={LABEL}>
          storage
        </text>
        <text x={SIDE_X + 18} y={Y.signIn + 6} className={LABEL}>
          Sign-in
        </text>
        <text x={SIDE_X + 18} y={Y.postgres + 6} className={LABEL}>
          Admin
        </text>
        <text
          x={(EDGE + MAIN_X) / 2 + 6}
          y={Y.postgres + 30}
          textAnchor="middle"
          className={NOTE}
        >
          read only
        </text>

        <Marker id="out" x={ZONE.x} y={Y.functions} active={active} />
        <Marker
          id="keys"
          x={MAIN_X + 30}
          y={Y.functions - 26}
          active={active}
        />
        <Marker id="role" x={MAIN_X + 32} y={Y.postgres - 30} active={active} />
        <Marker id="admin" x={EDGE} y={Y.postgres} active={active} />
      </motion.g>
    </motion.svg>
  );
}
