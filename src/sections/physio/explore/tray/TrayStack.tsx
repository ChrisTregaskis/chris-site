import { EmptyResult } from "../../EmptyResult";
import { type LeakView, spotOf } from "../../leakTest";
import { ORGS } from "../../organisations";
import { MOVE } from "../../stackMotion";
import { TableColumns } from "../../TableColumns";
import { TABLE_FACE_H } from "../sceneMeasures";
import { PhonePolicy } from "../PhonePolicy";
import { PhoneScene } from "../PhoneScene";
import { PhoneSheet } from "../PhoneSheet";
import { TRAY, trayPose, trayView } from "./trayGeometry";
import { cn } from "@/lib/cn";

interface TrayStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
}

const across = (inset: number) => ({
  left: `${inset}px`,
  width: `calc(100% - ${2 * inset}px)`,
});

/**
 * Exploration, draft A ("Tray"): the desktop's 3D stack re-cut for a
 * phone. Decorative (the query and its line say it all).
 */
export function TrayStack({ view, attempt, still }: TrayStackProps) {
  const sheet = across(TRAY.inset);
  const plane = across(TRAY.plane.inset);
  return (
    <PhoneScene
      draft="a"
      perspective={TRAY.perspective}
      eyeY={TRAY.eyeY}
      axisY={TRAY.axisY}
      view={trayView(view.asked)}
    >
      {/* The one table's plate and its columns, while the sheets lie as one. */}
      <div
        className={cn(
          MOVE,
          "absolute rounded-[10px] bg-raised/60",
          view.asked ? "opacity-0" : "opacity-100",
        )}
        style={{
          ...sheet,
          top: 0,
          height: TABLE_FACE_H,
          transitionDuration: "var(--duration-slow)",
          transform: `translate3d(0, ${TRAY.table.y}px, ${TRAY.table.z - 1}px)`,
        }}
      >
        <TableColumns className="h-[22px] items-center px-3 pl-[28px] text-[14px] leading-none" />
      </div>
      {ORGS.map((org) => {
        const spot = spotOf(view, org);
        const { y, z } = trayPose(spot, view.asking);
        const asked = view.asking && org === view.target;
        return (
          <PhoneSheet
            key={org}
            org={org}
            spot={spot}
            {...sheet}
            place={{ transform: `translate3d(0, ${y}px, ${z}px)` }}
            order={spot.at === "held" ? spot.slot : 0}
            lunge={
              asked
                ? {
                    attempt,
                    keyframes: {
                      y: [0, TRAY.lunge.y, 0, TRAY.lunge.y / 3, 0],
                      z: [0, TRAY.lunge.z, 0, TRAY.lunge.z / 3, 0],
                    },
                  }
                : null
            }
            still={still}
          />
        );
      })}
      <PhonePolicy
        live={view.asked}
        named={view.testing}
        attempt={attempt}
        {...plane}
        height={TRAY.plane.h}
        place={{
          transform: `translate3d(0, ${TRAY.plane.y}px, ${TRAY.plane.z}px)`,
        }}
        ruleTop={TRAY.ruleTop}
        facing={`rotateX(-${TRAY.apart}deg)`}
        still={still}
      />
      <EmptyResult
        shown={view.asked && view.returned === null}
        className="top-0 rounded-[10px] text-[16px]"
        style={{
          ...sheet,
          height: TRAY.empty.h,
          transform: `translate3d(0, ${TRAY.empty.y}px, ${TRAY.result.z + 1}px)`,
        }}
      />
    </PhoneScene>
  );
}
