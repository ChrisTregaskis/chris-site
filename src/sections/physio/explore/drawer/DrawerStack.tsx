import { EmptyResult } from "../../EmptyResult";
import { type LeakView, spotOf } from "../../leakTest";
import { ORGS } from "../../organisations";
import { MOVE } from "../../stackMotion";
import { TableColumns } from "../../TableColumns";
import { PhonePolicy } from "../PhonePolicy";
import { PhoneScene } from "../PhoneScene";
import { PhoneSheet } from "../PhoneSheet";
import { TABLE_FACE_H } from "../sceneMeasures";
import { DRAWER, drawerPose, drawerView } from "./drawerGeometry";
import { cn } from "@/lib/cn";

interface DrawerStackProps {
  view: LeakView;
  attempt: number;
  still: boolean;
}

const across = (inset: number) => ({
  left: `${inset}px`,
  width: `calc(100% - ${2 * inset}px)`,
});

/**
 * Exploration, draft B ("Drawer"): index cards that fan out and drop into
 * a drawer whose dashed front is the policy. Decorative (the query and its
 * line say it all).
 */
export function DrawerStack({ view, attempt, still }: DrawerStackProps) {
  const card = across(DRAWER.inset);
  const front = across(DRAWER.front.inset);
  const frontY = DRAWER.front.y + (view.asked ? 0 : DRAWER.front.rise);
  return (
    <PhoneScene
      draft="b"
      perspective={DRAWER.perspective}
      eyeY={DRAWER.eyeY}
      axisY={DRAWER.axisY}
      view={drawerView(view.asked)}
    >
      {/* The one table's card and its columns, while the cards stand as one. */}
      <div
        className={cn(
          MOVE,
          "absolute top-0 rounded-[10px] bg-raised/60",
          view.asked ? "opacity-0" : "opacity-100",
        )}
        style={{
          ...card,
          height: TABLE_FACE_H,
          transitionDuration: "var(--duration-slow)",
          transform: `translate3d(0, ${DRAWER.table.y}px, ${DRAWER.table.z - 1}px)`,
        }}
      >
        <TableColumns className="h-[22px] items-center px-3 pl-[28px] text-[14px] leading-none" />
      </div>
      {ORGS.map((org, column) => {
        const spot = spotOf(view, org);
        const { y, z } = drawerPose(spot);
        const asked = view.asking && org === view.target;
        return (
          <PhoneSheet
            key={org}
            org={org}
            spot={spot}
            {...card}
            tab={column}
            heldDepth={DRAWER.held.depth}
            place={{ transform: `translate3d(0, ${y}px, ${z}px)` }}
            order={spot.at === "held" ? spot.slot : 0}
            flourish={{
              state: view.asked ? "fanned" : "together",
              origin: "50% 100%",
              variants: {
                fanned: { rotateZ: [0, DRAWER.fan[column], 0] },
                together: { rotateZ: 0 },
              },
            }}
            lunge={
              asked
                ? {
                    attempt,
                    keyframes: {
                      y: [0, DRAWER.jump.y, 0, DRAWER.jump.y / 4, 0],
                      z: [0, DRAWER.jump.z, 0, DRAWER.jump.z / 4, 0],
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
        {...front}
        height={DRAWER.front.h}
        place={{
          transform: `translate3d(0, ${frontY}px, ${DRAWER.front.z}px)`,
        }}
        ruleTop={DRAWER.ruleTop}
        legendTop={DRAWER.legendTop}
        facing={`rotateX(${-DRAWER.apart}deg)`}
        still={still}
      />
      <EmptyResult
        shown={view.asked && view.returned === null}
        className="top-0 rounded-[10px] text-[16px]"
        style={{
          ...card,
          height: DRAWER.empty.h,
          transform: `translate3d(0, ${DRAWER.empty.y}px, ${DRAWER.result.z + 1}px)`,
        }}
      />
    </PhoneScene>
  );
}
