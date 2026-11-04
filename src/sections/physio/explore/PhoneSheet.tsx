import { motion, type TargetAndTransition, type Variants } from "framer-motion";
import { type Spot } from "../leakTest";
import { type Org, ORG_TINT, rowsOf } from "../organisations";
import { apartTiming, HIT_TIMES } from "../stackMotion";
import { FACE, faceHeight, TABLE_FACE_H } from "./sceneMeasures";
import { SheetPlate, tabLeft } from "./SheetPlate";
import { SheetRows } from "./SheetRows";
import { MOVE_3D, type SheetPlace } from "./sheetMotion";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/ui/tokens/motion";

interface PhoneSheetProps {
  org: Org;
  spot: Spot;
  place: SheetPlace;
  /** Stagger: 0 moves first. */
  order: number;
  /** Its box across the scene, as CSS. */
  left: string;
  width: string;
  /** Plays each time `attempt` changes: the sheet trying to come forward. Null when it isn't the one asked for. */
  lunge: {
    attempt: number;
    keyframes: TargetAndTransition;
    origin?: string;
  } | null;
  /** Plays its `state` variant whenever that changes: a flourish on the way to a new spot (draft B's fan). */
  flourish?: { state: string; variants: Variants; origin: string };
  /** An index tab at this column (of three) carries its name, above the sheet (draft B). */
  tab?: number;
  /** Held, its body runs this deep (down into draft B's drawer), so no edge shows through the policy. */
  heldDepth?: number;
  /** Held, the sheet shows as it tips over and then goes (draft C draws the held ones itself). */
  tipping?: boolean;
  still: boolean;
}

/**
 * Exploration: one organisation's rows on its own see-through sheet, in a
 * phone drawing's 3D scene. At rest its rows sit at their places in the one
 * table (the sheets lie as one); as the result its rows close up under its
 * name and its edge glows; held, its rows fold away and only its name
 * shows. Its size never changes: it moves by transform alone.
 */
export function PhoneSheet({
  org,
  spot,
  place,
  order,
  left,
  width,
  lunge,
  flourish,
  tab,
  heldDepth,
  tipping = false,
  still,
}: PhoneSheetProps) {
  const timing = apartTiming(order);
  const named = spot.at === "result" || (spot.at === "held" && !tipping);
  const lunging = lunge !== null && !still;

  return (
    <div
      data-sheet={org}
      data-spot={spot.at}
      className={cn(MOVE_3D, "absolute top-0 [transform-style:preserve-3d]")}
      style={{
        ...timing,
        left,
        width,
        height: TABLE_FACE_H,
        transform: place.transform,
        transformOrigin: place.origin ?? "0 0",
      }}
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ transformOrigin: flourish?.origin }}
        variants={flourish?.variants}
        initial={false}
        animate={flourish && !still ? flourish.state : undefined}
        transition={{ duration: DURATION.apart, ease: [...EASE.lift] }}
      >
        {/* Remounted per attempt, so each one replays. */}
        <motion.div
          key={lunging ? `attempt-${lunge.attempt}` : "rest"}
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={{ transformOrigin: lunge?.origin }}
          animate={lunging && lunge.attempt > 0 ? lunge.keyframes : undefined}
          transition={{
            delay: DURATION.state,
            duration: DURATION.apart,
            ease: [...EASE.lift],
            times: HIT_TIMES,
          }}
        >
          <SheetPlate
            org={org}
            spot={spot}
            height={faceHeight(rowsOf(org).length)}
            timing={timing}
            tab={tab}
            heldDepth={heldDepth}
            tipping={tipping}
            still={still}
          />
          <p
            className={cn(
              MOVE_3D,
              "absolute top-0 m-0 flex h-[22px] items-center gap-[7px] whitespace-nowrap text-[16px] font-semibold leading-none",
              ORG_TINT[org].text,
              named ? "opacity-100" : "opacity-0",
            )}
            style={{
              ...timing,
              left:
                tab === undefined ? FACE.side : `calc(${tabLeft(tab)} + 10px)`,
            }}
          >
            <i className={cn("size-[7px] rounded-pill", ORG_TINT[org].bg)} />
            {org}
          </p>
          <SheetRows org={org} spot={spot} slow={tipping} still={still} />
        </motion.div>
      </motion.div>
    </div>
  );
}
