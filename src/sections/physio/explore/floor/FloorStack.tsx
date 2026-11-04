import { motion } from "framer-motion";
import { EmptyResult } from "../../EmptyResult";
import { type LeakView, spotOf } from "../../leakTest";
import {
  ORG_TINT,
  ORGS,
  POLICY_RULE,
  rowsOf,
  sheetEdge,
} from "../../organisations";
import { FLASH_TIMES, HIT_TIMES, MOVE } from "../../stackMotion";
import { TableColumns } from "../../TableColumns";
import { PhoneScene } from "../PhoneScene";
import { PhoneSheet } from "../PhoneSheet";
import { faceHeight, TABLE_FACE_H } from "../sceneMeasures";
import { FACING, FLOOR, floorPlace, floorView } from "./floorGeometry";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface FloorStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
}

const across = (inset: number) => ({
  left: `${inset}px`,
  width: `calc(100% - ${2 * inset}px)`,
});

/** A held sheet's column under the glass, as CSS. */
function slabSpan(column: number): { left: string; width: string } {
  const { inset, gap } = FLOOR.slab;
  const width = `((100% - ${2 * inset + 2 * gap}px) / 3)`;
  return {
    left: `calc(${inset}px + ${column} * (${width} + ${gap}px))`,
    width: `calc(${width})`,
  };
}

/** A lying slab's name strip, turned from flat back up to face the viewer. */
const SPINE_FACING = `rotateX(${-90 - FLOOR.apart}deg)`;

/**
 * Exploration, draft C ("Glass floor"): the rest of the table tips over
 * and lies pressed flat under a glass floor, the policy; what comes back
 * stands on it, facing you. Decorative (the query and its line say it all).
 */
export function FloorStack({ view, attempt, still }: FloorStackProps) {
  const sheet = across(FLOOR.inset);
  const glass = across(FLOOR.edge.inset);
  const live = view.asked;
  const named = view.testing;
  const flash = attempt > 0 && !still;
  const hit = {
    delay: DURATION.state,
    duration: DURATION.apart,
    times: FLASH_TIMES,
  };
  return (
    <PhoneScene
      draft="c"
      perspective={FLOOR.perspective}
      eyeY={FLOOR.eyeY}
      axisY={FLOOR.y}
      view={floorView(view.asked)}
    >
      {/* The one table's plate and its columns, while the sheets stand as one. */}
      <div
        className={cn(
          MOVE,
          "absolute top-0 rounded-[10px] bg-raised/60",
          view.asked ? "opacity-0" : "opacity-100",
        )}
        style={{
          ...sheet,
          height: TABLE_FACE_H,
          transitionDuration: "var(--duration-slow)",
          transform: `translate3d(0, ${FLOOR.table.y}px, -1px)`,
        }}
      >
        <TableColumns className="h-[22px] items-center px-3 pl-[28px] text-[14px] leading-none" />
      </div>
      {/* The glass floor: lying flat, running back from its front edge. */}
      <div
        data-policy
        className="absolute top-0 origin-bottom transition-[transform,opacity] ease-lift [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{
          ...glass,
          height: FLOOR.depth,
          transform: `translate3d(0, ${FLOOR.y - FLOOR.depth + (live ? 0 : 24)}px, 0) rotateX(90deg)`,
          opacity: live ? 1 : 0,
          transitionDuration: "var(--duration-apart)",
          transitionDelay: live ? "var(--duration-state)" : undefined,
        }}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[12px] border-2 border-dashed bg-surface/55 transition-[border-color,box-shadow] duration-slow motion-reduce:transition-none",
            named
              ? "border-accent shadow-[0_0_40px_-14px_rgb(var(--color-accent)/0.55)]"
              : "border-line-strong",
          )}
        />
        <motion.span
          key={named ? "named" : "quiet"}
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={named && !still ? { opacity: [0, 0.14, 0] } : { opacity: 0 }}
          transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
        />
        <motion.span
          key={`attempt-${attempt}`}
          className="absolute inset-0 rounded-[12px] bg-accent"
          initial={{ opacity: 0 }}
          animate={flash ? { opacity: [0, 0, 0.35, 0] } : { opacity: 0 }}
          transition={hit}
        />
      </div>
      {/* The glass's front edge, facing you: its rule, then (step 3) its name. */}
      <div
        className={cn(
          "absolute top-0 origin-top rounded-b-[8px] border-2 border-t-0 border-dashed bg-surface transition-[transform,opacity,border-color] ease-lift motion-reduce:transition-none wide:bg-tone-physio",
          named ? "border-accent" : "border-line-strong",
        )}
        style={{
          ...glass,
          height: FLOOR.edge.h,
          transform: `translate3d(0, ${FLOOR.y + (live ? 0 : 24)}px, 0) ${FACING}`,
          opacity: live ? 1 : 0,
          transitionDuration: "var(--duration-apart)",
          transitionDelay: live ? "var(--duration-state)" : undefined,
        }}
      >
        <p
          className={cn(
            "absolute inset-0 m-0 flex items-center whitespace-nowrap px-3 text-[14px] font-medium leading-none text-muted transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-0" : "opacity-100",
          )}
        >
          {POLICY_RULE}
        </p>
        <p
          className={cn(
            "absolute inset-0 m-0 flex items-center px-3 text-[15px] font-semibold leading-none text-accent transition-opacity duration-slow motion-reduce:transition-none",
            named ? "opacity-100" : "opacity-0",
          )}
        >
          row-level security
        </p>
      </div>
      {ORGS.map((org) => {
        const spot = spotOf(view, org);
        const height = faceHeight(rowsOf(org).length);
        return (
          <PhoneSheet
            key={org}
            org={org}
            spot={spot}
            {...sheet}
            place={{
              transform: floorPlace(spot, height),
              origin: `50% ${height}px`,
            }}
            order={spot.at === "held" ? spot.slot : 0}
            tipping
            lunge={null}
            still={still}
          />
        );
      })}
      {/* The held sheets, lying flat under the glass, each in its own column. */}
      {ORGS.map((org, column) => {
        const held = spotOf(view, org).at === "held";
        const asked = view.asking && org === view.target;
        const lift = asked && attempt > 0 && !still;
        return (
          <div
            key={org}
            data-slab={org}
            className="absolute top-0 origin-bottom transition-opacity ease-lift [transform-style:preserve-3d] motion-reduce:transition-none"
            style={{
              ...slabSpan(column),
              height: FLOOR.slab.depth,
              transform: `translate3d(0, ${FLOOR.slab.y - FLOOR.slab.depth}px, 0) rotateX(90deg)`,
              opacity: held ? 1 : 0,
              transitionDuration: held
                ? "var(--duration-slow)"
                : "var(--duration-fast)",
              transitionDelay: held ? "var(--duration-together)" : undefined,
            }}
          >
            {/* Remounted per attempt, so each one replays. */}
            <motion.div
              key={lift ? `attempt-${attempt}` : "rest"}
              className="absolute inset-0 origin-bottom [transform-style:preserve-3d]"
              animate={
                lift
                  ? { rotateX: [0, FLOOR.lift, 0, FLOOR.lift / 4, 0] }
                  : undefined
              }
              transition={{
                delay: DURATION.state,
                duration: DURATION.apart,
                ease: [...EASE.lift],
                times: HIT_TIMES,
              }}
            >
              <div
                className="absolute inset-0 rounded-[8px] bg-raised"
                style={{ boxShadow: sheetEdge(org, false) }}
              />
              <p
                className={cn(
                  "absolute inset-x-0 top-full m-0 flex origin-top items-center gap-[7px] rounded-[6px] bg-raised px-[10px] text-[15px] font-semibold leading-none",
                  ORG_TINT[org].text,
                )}
                style={{
                  height: FLOOR.slab.spine,
                  transform: SPINE_FACING,
                  boxShadow: sheetEdge(org, false),
                }}
              >
                <i
                  className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)}
                />
                {org}
              </p>
            </motion.div>
          </div>
        );
      })}
      <EmptyResult
        shown={view.asked && view.returned === null}
        className="top-0 origin-bottom rounded-[10px] text-[16px]"
        style={{
          ...sheet,
          height: FLOOR.emptyH,
          transform: `translate3d(0, ${FLOOR.y - FLOOR.emptyH}px, ${FLOOR.stand.z + 1}px) ${FACING}`,
        }}
      />
    </PhoneScene>
  );
}
