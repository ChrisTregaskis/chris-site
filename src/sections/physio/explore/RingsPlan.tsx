import { motion } from "framer-motion";
import { useId } from "react";
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
 * Direction C: the platform from above, as rings round the data. Postgres
 * is the centre, inside its policy's ring; the functions ride an orbit
 * inside the private network's ring; the API comes in from the top, the
 * one way in; the orbit's only spokes out end at private endpoints in the
 * ring, to sign-in and video storage, which the CDN fronts from outside;
 * the one line out stops dead at the ring; the admin's dashed spoke comes
 * straight in to the centre, read only. Concentric and flat: nothing like
 * Wayfinder's exploded board.
 */

/** The drawing's frame, cropped to what's drawn (so phones get the largest type). */
const VIEW = { x: 34, y: 34, w: 392, h: 362 };
const CX = 220;
const CY = 226;

const R = {
  outside: 170,
  network: 134,
  orbit: 104,
  policy: 58,
  data: 40,
};

const ANGLE = {
  api: -90,
  cdn: -42,
  storage: 12,
  signIn: 52,
  admin: 140,
  role: -30,
};

function polar(r: number, degrees: number): [number, number] {
  const a = (degrees * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const at = (r: number, degrees: number) => polar(r, degrees).join(" ");

/** An arc on radius `r` from one angle to another, clockwise. */
function arc(r: number, from: number, to: number): string {
  const large = to - from > 180 ? 1 : 0;
  return `M${at(r, from)} A${r} ${r} 0 ${large} 1 ${at(r, to)}`;
}

const LABEL = "fill-ink font-body text-[17px] font-semibold";
const NOTE = "fill-muted font-body text-[16px]";

function Node({
  r,
  angle,
  size = 7,
}: {
  r: number;
  angle: number;
  size?: number;
}) {
  const [x, y] = polar(r, angle);
  return (
    <circle
      cx={x}
      cy={y}
      r={size}
      className="fill-[rgb(var(--color-tone-physio))] stroke-ink"
      strokeWidth={3}
    />
  );
}

export function RingsPlan({ active, still }: ArchFigureProps) {
  const policyPath = `arch-policy-${useId().replace(/:/g, "")}`;
  const caps = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  const [fx, fy] = polar(R.orbit, ANGLE.api);
  // The line out: straight across from the functions to the ring, where it stops.
  const outX = CX - Math.sqrt(R.network ** 2 - (fy - CY) ** 2);
  const [adminX, adminY] = polar(R.outside, ANGLE.admin);
  const [roleX, roleY] = polar(R.policy, ANGLE.role);
  const [eyeX, eyeY] = polar(R.network, ANGLE.admin);
  const spoke = (angle: number) =>
    `M${at(R.orbit, angle)} L${at(R.outside - 9, angle)}`;
  const endpoint = (angle: number) => {
    const [x, y] = polar(R.network, angle);
    return (
      <rect
        key={angle}
        x={x - 9}
        y={y - 5}
        width={18}
        height={10}
        rx={5}
        transform={`rotate(${angle} ${x} ${y})`}
        className="fill-[rgb(var(--color-tone-physio))]"
        stroke="currentColor"
        strokeWidth={2}
      />
    );
  };

  return (
    <motion.svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      role="img"
      aria-labelledby="arch-c-title"
      className="block h-auto w-full"
      {...drawIn(still)}
    >
      <title id="arch-c-title">
        The platform from above, as rings round the data: Postgres at the centre
        inside its row-level security policy, the functions on an orbit inside
        the private network&apos;s ring, the API coming in from the top as the
        one way in, private endpoints in the ring out to sign-in and video
        storage, which the CDN fronts from outside, no way out, and an
        admin&apos;s read-only spoke straight in to the centre.
      </title>
      <defs>
        <path
          id={policyPath}
          d={`M${at(R.policy + 16, 135)} A${R.policy + 16} ${R.policy + 16} 0 0 0 ${at(R.policy + 16, 20)}`}
        />
      </defs>

      {/* The rings */}
      <motion.g variants={fade(0)}>
        <circle
          cx={CX}
          cy={CY}
          r={R.network}
          className="fill-tenant-teal/[0.09] stroke-tenant-teal/50"
          strokeWidth={1.5}
        />
        <text
          x={CX}
          y={CY + R.network - 22}
          textAnchor="middle"
          className={NOTE}
        >
          Private network
        </text>
        <text x={VIEW.x + 8} y={70} className={NOTE}>
          The internet
        </text>
      </motion.g>

      {/* Video: the CDN in front of storage, round the outside */}
      <motion.path
        variants={draw(0.35)}
        d={arc(R.outside, ANGLE.cdn, ANGLE.storage)}
        className="stroke-tenant-teal"
        strokeWidth={6}
        {...caps}
      />
      {/* The functions' orbit and its two spokes out, through endpoints */}
      <motion.path
        variants={draw(0.55)}
        d={arc(R.orbit, ANGLE.api, ANGLE.signIn)}
        className="stroke-line-strong"
        strokeWidth={4}
        {...caps}
      />
      <motion.path
        variants={draw(0.8)}
        d={spoke(ANGLE.storage)}
        className="stroke-line-strong"
        strokeWidth={4}
        {...caps}
      />
      <motion.path
        variants={draw(0.9)}
        d={spoke(ANGLE.signIn)}
        className="stroke-line-strong"
        strokeWidth={4}
        {...caps}
      />

      {/* A request: from the API, through the functions, to the data */}
      <motion.path
        variants={draw(0.1)}
        d={`M${CX} ${CY - R.outside} V${CY - R.data}`}
        className="stroke-accent"
        strokeWidth={6}
        {...caps}
      />

      {/* The line out that isn't there */}
      <motion.path
        variants={fade(1)}
        d={`M${fx - 12} ${fy} H${outX + 12}`}
        className={lit(active, "out")}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="2 6"
        {...caps}
      />

      {/* The admin's spoke: dashed, read only, straight to the data */}
      <motion.path
        variants={fade(1.1)}
        d={`M${at(R.outside - 10, ANGLE.admin)} L${at(R.policy + 2, ANGLE.admin)}`}
        className={lit(active, "admin")}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="7 6"
        {...caps}
      />

      <motion.g variants={fade(0.8)}>
        {/* The data, in its policy */}
        <circle
          cx={CX}
          cy={CY}
          r={R.policy}
          className={cn(lit(active, "role"), "fill-none")}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <circle cx={CX} cy={CY} r={R.data} className="fill-ink" />
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          className="fill-[rgb(var(--color-tone-physio))] font-body text-[16px] font-semibold"
        >
          Postgres
        </text>
        <text className={cn(NOTE, "fill-accent")}>
          <textPath
            href={`#${policyPath}`}
            startOffset="50%"
            textAnchor="middle"
          >
            row-level security
          </textPath>
        </text>

        <g className={lit(active, "out")}>
          {endpoint(ANGLE.storage)}
          {endpoint(ANGLE.signIn)}
        </g>

        <Node r={R.outside} angle={ANGLE.api} />
        <Node r={R.outside} angle={ANGLE.cdn} />
        <Node r={R.outside} angle={ANGLE.storage} size={8} />
        <Node r={R.outside} angle={ANGLE.signIn} />
        <Node r={R.orbit} angle={ANGLE.api} size={9} />
        <Node r={R.outside} angle={ANGLE.admin} />

        <text x={CX + 18} y={CY - R.outside + 6} className={LABEL}>
          API
        </text>
        <text x={fx - 12} y={fy + 32} textAnchor="end" className={LABEL}>
          Functions
        </text>
        {(() => {
          const [x, y] = polar(R.outside, ANGLE.cdn);
          return (
            <text x={x + 16} y={y + 2} className={LABEL}>
              CDN
            </text>
          );
        })()}
        {(() => {
          const [x, y] = polar(R.outside, ANGLE.storage);
          return (
            <>
              <text x={x} y={y + 30} textAnchor="middle" className={LABEL}>
                Video
              </text>
              <text x={x} y={y + 49} textAnchor="middle" className={LABEL}>
                storage
              </text>
            </>
          );
        })()}
        {(() => {
          const [x, y] = polar(R.outside, ANGLE.signIn);
          return (
            <text x={x + 14} y={y + 24} className={LABEL}>
              Sign-in
            </text>
          );
        })()}
        <text x={adminX} y={adminY + 30} textAnchor="middle" className={LABEL}>
          Admin
        </text>

        <Marker id="out" x={outX} y={fy} active={active} />
        <Marker id="keys" x={CX + 26} y={fy + 30} active={active} />
        <Marker id="role" x={roleX} y={roleY} active={active} />
        <Marker id="admin" x={eyeX} y={eyeY} active={active} />
      </motion.g>
    </motion.svg>
  );
}
