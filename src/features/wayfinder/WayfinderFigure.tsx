import {
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  type Detail,
  DRAW_ITEMS,
  facesOf,
  itemKey,
  PLATE,
  PLATE_PIECE,
  type SubComponent,
  SUBS,
} from "./explode";
import {
  type Badge,
  BADGES,
  type BoxFaces,
  type RouteKey,
  ROUTE_KEYS,
  routePath,
  VIEW_BOX,
} from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { TAG_PX, tagLayout, type TagSpec } from "./tags";
import { useExplode } from "./useExplode";
import { useFigureZoom } from "./useFigureZoom";
import { cn } from "@/lib/cn";

interface FaceState {
  base?: boolean;
  on: boolean;
  hot: boolean;
  /** The live AI platform cartridge. */
  live?: boolean;
  /** Another part is selected: a quieter, still opaque, palette. */
  dim?: boolean;
  /** Another piece of its part is picked out: it steps back the same way. */
  quiet?: boolean;
}

type Face = keyof BoxFaces;

const OFF: Record<Face, string> = {
  top: "fill-figure-top",
  left: "fill-figure-left",
  right: "fill-figure-right",
};
const BASE_OFF: Record<Face, string> = {
  top: "fill-panel",
  left: "fill-figure-base-left",
  right: "fill-figure-base-right",
};
const DIM: Record<Face, string> = {
  top: "fill-figure-left",
  left: "fill-figure-right",
  right: "fill-figure-base-left",
};
const ON: Record<Face, string> = {
  top: "fill-accent",
  left: "fill-figure-on-left",
  right: "fill-accent-strong",
};

function faceFill(face: Face, state: FaceState): string {
  if (face === "top") {
    if (state.live) return "fill-ink";
    if (state.base && state.on) return "fill-figure-base-on";
    if (state.hot) return "fill-signal";
  }
  if (state.on && !state.quiet) return ON[face];
  if (state.base) return BASE_OFF[face];
  if (state.hot) return OFF[face];
  return state.dim === true || state.quiet === true ? DIM[face] : OFF[face];
}

function strokeFor(state: FaceState): string {
  if (state.live) return "stroke-ink";
  if (state.hot) return "stroke-signal";
  if (state.on && state.quiet) return "stroke-accent/60";
  if (state.on) return "stroke-accent";
  if (state.dim && !state.base) return "stroke-line-hover";
  return "stroke-line-strong";
}

const SHAPE =
  "stroke-[1.2] [stroke-linejoin:round] transition-[fill,stroke] duration-state motion-reduce:transition-none";

function Faces({ faces, state }: { faces: BoxFaces; state: FaceState }) {
  const stroke = strokeFor(state);
  return (
    <>
      {(["left", "right", "top"] as const).map((face) => (
        <polygon
          key={face}
          points={faces[face]}
          className={cn(SHAPE, faceFill(face, state), stroke)}
        />
      ))}
    </>
  );
}

const LABEL = "font-body text-[14px] font-medium fill-muted";

function PartBadge({ badge, on }: { badge: Badge; on: boolean }) {
  return (
    <>
      <line
        {...badge.lead}
        className="stroke-line-strong stroke-1 [stroke-dasharray:2_3]"
      />
      <g>
        <circle
          cx={badge.cx}
          cy={badge.cy}
          r={15}
          className={cn(
            "stroke-[1.3] transition-[fill,stroke] duration-state motion-reduce:transition-none max-wide:[r:24px]",
            on
              ? "fill-accent stroke-accent"
              : "fill-surface stroke-line-strong",
          )}
        />
        <text
          x={badge.cx}
          y={badge.cy}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn(
            "font-body text-[17px] font-semibold max-wide:text-[26px]",
            on ? "fill-on-accent" : "fill-ink",
          )}
        >
          {badge.n}
        </text>
      </g>
    </>
  );
}

interface PartGroupProps {
  id: PartId;
  selected: PartId | null;
  hot: ReadonlySet<PartId>;
  onPart: (id: PartId) => void;
  children: (state: FaceState) => ReactNode;
}

function PartGroup({ id, selected, hot, onPart, children }: PartGroupProps) {
  const on = selected === id;
  const isHot = hot.has(id);
  // Dimmed by colour rather than opacity: pieces of different parts
  // interleave in paint order, and see-through faces would show each other.
  const dim = selected !== null && !on && !isHot;
  return (
    <g data-part={id} onClick={() => onPart(id)} className="cursor-pointer">
      {children({ on, hot: isHot, dim })}
    </g>
  );
}

const DETAIL_STROKE = "stroke-[1.1] [stroke-linejoin:round]";

function Details({
  details,
  stroke,
  on,
}: {
  details: readonly Detail[];
  stroke: string;
  on: boolean;
}) {
  return (
    <>
      {details.map((detail, index) => {
        switch (detail.kind) {
          case "outline":
            return (
              <polygon
                key={index}
                points={detail.points}
                className={cn(
                  SHAPE,
                  "fill-none",
                  stroke,
                  detail.dashed && "[stroke-dasharray:3_3]",
                )}
              />
            );
          case "inlay":
            return (
              <polygon
                key={index}
                points={detail.points}
                className={cn(SHAPE, "fill-surface", stroke)}
              />
            );
          case "line":
            return (
              <polyline
                key={index}
                points={detail.points}
                className={cn(DETAIL_STROKE, "fill-none", stroke)}
              />
            );
          case "eye":
            return (
              <ellipse
                key={index}
                cx={detail.cx}
                cy={detail.cy}
                rx={22}
                ry={11}
                className="fill-surface stroke-line-strong stroke-[1.2]"
              />
            );
          case "text":
            return (
              <text
                key={index}
                x={detail.x}
                y={detail.y}
                textAnchor="middle"
                className={cn(
                  LABEL,
                  on && (detail.above ? "fill-accent" : "fill-on-accent"),
                )}
              >
                {detail.text}
              </text>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

function Piece({
  sub,
  state,
  apart,
}: {
  sub: SubComponent;
  state: FaceState;
  apart: boolean;
}) {
  const stroke = strokeFor(state);
  return (
    <g
      className={cn(
        sub.prototype &&
          apart &&
          "[&_polygon]:[stroke-dasharray:4_3] [&_polyline]:[stroke-dasharray:4_3]",
      )}
    >
      {sub.boxes.map((b, index) => (
        <Faces key={index} faces={facesOf(b)} state={state} />
      ))}
      {sub.details ? (
        <Details
          details={sub.details}
          stroke={stroke}
          on={state.on && !state.live}
        />
      ) : null}
    </g>
  );
}

/**
 * A piece's number tag: a dot on the piece, a leader, and its number, set at
 * a fixed size on screen (`unitsPerPx` user units to the px). Positions are
 * written by `useExplode` as the pieces move; this only draws the parts.
 */
function PieceTag({
  tag,
  unitsPerPx: u,
  on,
  quiet,
  register,
}: {
  tag: TagSpec;
  unitsPerPx: number;
  /** Its part is the one in focus. */
  on: boolean;
  /** Another piece of its part is picked out: this one steps back. */
  quiet: boolean;
  register: (key: string) => (node: SVGElement | null) => void;
}) {
  const strong = on && !quiet;
  return (
    <g
      ref={register(`tag:${tag.id}`)}
      data-tag={tag.id}
      style={{ opacity: 0 }}
      className="pointer-events-none"
    >
      <line
        ref={register(`lead:${tag.id}`)}
        strokeWidth={u}
        className={cn(
          "transition-[stroke] duration-base motion-reduce:transition-none",
          strong ? "stroke-accent/70" : "stroke-muted/50",
        )}
      />
      <circle
        ref={register(`dot:${tag.id}`)}
        r={TAG_PX.dot * u}
        className={strong ? "fill-accent" : "fill-muted"}
      />
      <text
        ref={register(`num:${tag.id}`)}
        textAnchor={tag.anchor}
        dominantBaseline="central"
        strokeWidth={4 * u}
        style={{ fontSize: TAG_PX.font * u }}
        className={cn(
          "font-body font-semibold tabular-nums [paint-order:stroke] stroke-tone-wayfinder [stroke-linejoin:round] transition-[fill] duration-base motion-reduce:transition-none",
          strong ? "fill-accent" : "fill-muted",
        )}
      >
        {tag.id}
      </text>
    </g>
  );
}

/** A piece, or an AI platform cartridge (which stands lifted unless live). */
function PieceBody({
  sub,
  apart,
  state,
  platform,
  onSlot,
}: {
  sub: SubComponent;
  apart: boolean;
  state: FaceState;
  platform: PlatformIndex;
  onSlot: (index: PlatformIndex) => void;
}) {
  const cartridge = sub.platform;
  if (cartridge === undefined) {
    return <Piece sub={sub} apart={apart} state={state} />;
  }
  return (
    <g
      data-slot={"ABC"[cartridge]}
      onClick={(event) => {
        event.stopPropagation();
        onSlot(cartridge);
      }}
    >
      <Piece
        sub={sub}
        apart={apart}
        state={{ ...state, live: cartridge === platform }}
      />
    </g>
  );
}

/** Where a piece stood on the plate, shown once it has lifted off. */
const footprintOf = (sub: SubComponent) =>
  sub.boxes.filter((b) => b.z === 0).map((b) => facesOf({ ...b, h: 0 }).top);

export interface WayfinderFigureProps {
  /** The part picked by scroll, click or the picker. */
  selected: PartId | null;
  /** Parts flashing as a message passes through them. */
  hot: ReadonlySet<PartId>;
  /** Pipes the current message has travelled. */
  lit: ReadonlySet<RouteKey>;
  platform: PlatformIndex;
  onPart: (id: PartId) => void;
  onSlot: (index: PlatformIndex) => void;
  /** The travelling message dot; moved by the demo. */
  pulseRef: Ref<SVGGElement>;
  /** Taken apart (the target state; the figure animates to it). */
  apart?: boolean;
  /** Phones: only the part in focus comes apart, in place, and it never grows. */
  lite?: boolean;
  /** Go back together quickly (a message is waiting to travel). */
  quick?: boolean;
  /** A piece picked out from its part's "Inside" list (e.g. "2.3"). */
  highlight?: string | null;
  reducedMotion?: boolean;
  /**
   * The sticky stage the figure pins in. Given (and not `lite`), the figure
   * grows into the room around it while taken apart.
   */
  stageRef?: RefObject<HTMLElement | null>;
  /** Hands up the figure's controls (to wait for it to reassemble). */
  onExplode?: (controls: ExplodeControls) => void;
}

export interface ExplodeControls {
  /** Resolves once the figure is fully back together. */
  whenAssembled: () => Promise<void>;
}

/**
 * Wayfinder's architecture as an isometric figure (after the `anatomy` style):
 * nine numbered parts on a cloud base plate, joined by the pipes a message
 * travels. Taken apart, every part lifts to its own tier and opens into its
 * numbered pieces, drawn in a paint order re-sorted as they move; the part in
 * focus is labelled. Decorative for assistive tech: the picker and each step's
 * "Inside" list say the same in words.
 */
export function WayfinderFigure({
  selected,
  hot,
  lit,
  platform,
  onPart,
  onSlot,
  pulseRef,
  apart = false,
  lite = false,
  quick = false,
  highlight = null,
  reducedMotion = false,
  stageRef,
  onExplode,
}: WayfinderFigureProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { zoom, unitsPerPx } = useFigureZoom(boxRef, stageRef, !lite);
  const placed = useMemo(
    () => tagLayout(lite, unitsPerPx, platform),
    [lite, unitsPerPx, platform],
  );
  const focus = apart ? selected : null;
  const { order, register, whenAssembled } = useExplode({
    apart,
    focus,
    lite,
    platform,
    zoom: lite ? 1 : zoom,
    quick,
    reducedMotion,
    placed,
  });
  const onExplodeRef = useRef(onExplode);
  onExplodeRef.current = onExplode;
  useEffect(() => {
    onExplodeRef.current?.({ whenAssembled });
  }, [whenAssembled]);

  // Picked out (from its part's "Inside" list, while that part is in
  // focus): that piece stays lit and its part's other pieces step back.
  const highlightPart = highlight
    ? (SUBS.find((sub) => sub.id === highlight)?.part ??
      (highlight === PLATE_PIECE.id ? "cloud" : null))
    : null;
  const pickedPart =
    highlightPart !== null && highlightPart === focus ? focus : null;
  const picked = pickedPart ? highlight : null;

  return (
    <div ref={boxRef} className="relative">
      <svg
        ref={register("zoom")}
        viewBox={VIEW_BOX}
        role="img"
        aria-label={
          apart
            ? "Wayfinder's architecture, taken apart: nine parts on a cloud base plate, each opened into its numbered pieces. Each step lists what is inside its part."
            : "Wayfinder's architecture as nine parts on a cloud base plate. Use the part picker below to explore each part."
        }
        data-apart={apart ? "" : undefined}
        data-lite={lite ? "" : undefined}
        data-picked={picked ?? undefined}
        className="block h-auto w-full origin-bottom-right overflow-visible wide:max-h-[66vh]"
      >
        <PartGroup id="cloud" selected={selected} hot={hot} onPart={onPart}>
          {(state) => (
            <Faces
              faces={PLATE}
              state={{
                ...state,
                base: true,
                quiet: pickedPart === "cloud" && picked !== PLATE_PIECE.id,
              }}
            />
          )}
        </PartGroup>

        {/* Where each piece seats, once it has lifted off the plate. */}
        <g aria-hidden="true" className="pointer-events-none">
          {SUBS.flatMap((sub) =>
            footprintOf(sub).map((points, index) => (
              <polygon
                key={`${sub.id}-${index}`}
                ref={index === 0 ? register(`foot:${sub.id}`) : undefined}
                points={points}
                style={{ opacity: 0 }}
                className="fill-accent/[0.06] stroke-accent/50 stroke-1 [stroke-dasharray:3_3]"
              />
            )),
          )}
        </g>

        {/* Pipes in two layers: every casing first, then every lit line on
            top, so pipes that share a run (the three specialists' runs to
            MCP) never paint over a lit one. They draw off as their parts
            lift. */}
        <g className="fill-none [stroke-linecap:round] [stroke-linejoin:round]">
          {ROUTE_KEYS.map((key) => {
            const d = routePath(key);
            return (
              <g key={key} ref={register(`route:${key}`)}>
                <path
                  d={d}
                  pathLength={1}
                  data-casing=""
                  className="stroke-line-strong stroke-[5]"
                />
                <path
                  d={d}
                  pathLength={1}
                  data-casing=""
                  className="stroke-surface stroke-[2.4]"
                />
              </g>
            );
          })}
          <g ref={register("lit")}>
            {ROUTE_KEYS.map((key) => (
              <path
                key={key}
                d={routePath(key)}
                data-route={key}
                pathLength={1}
                className={cn(
                  "stroke-signal stroke-[2.6] transition-opacity duration-state motion-reduce:transition-none",
                  lit.has(key) ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </g>
        </g>

        {/* Every piece and seating axis, back to front for where they are now. */}
        {order.map((index) => {
          const item = DRAW_ITEMS[index];
          const { sub } = item;
          const key = itemKey(item);
          if (item.kind === "axis") {
            return (
              <line
                key={key}
                ref={register(key)}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className={cn(
                  "pointer-events-none stroke-[1.2] [stroke-dasharray:2_4] [stroke-linecap:round]",
                  focus === sub.part ? "stroke-accent" : "stroke-accent/45",
                )}
              />
            );
          }
          return (
            <PartGroup
              key={key}
              id={sub.part}
              selected={selected}
              hot={hot}
              onPart={onPart}
            >
              {(state) => (
                <g ref={register(key)} data-piece={sub.id}>
                  <PieceBody
                    sub={sub}
                    apart={apart}
                    state={{
                      ...state,
                      quiet: pickedPart === sub.part && picked !== sub.id,
                    }}
                    platform={platform}
                    onSlot={onSlot}
                  />
                </g>
              )}
            </PartGroup>
          );
        })}

        <g ref={register("pulse")} aria-hidden="true">
          <g
            ref={pulseRef}
            transform="translate(-999,-999)"
            visibility="hidden"
          >
            <circle r={13} className="fill-signal opacity-25" />
            <circle r={6} className="fill-signal" />
          </g>
        </g>

        {/* Numbers float above everything: the parts' badges and, for the
            part in focus, each piece's own. */}
        <g aria-hidden="true">
          {PART_ORDER.map((part) => (
            <g
              key={part}
              ref={register(`badge:${part}`)}
              onClick={() => onPart(part)}
              className={cn(
                "cursor-pointer transition-opacity duration-state motion-reduce:transition-none",
                selected !== null &&
                  selected !== part &&
                  !hot.has(part) &&
                  "opacity-60",
              )}
            >
              <g ref={register(`badge-face:${part}`)}>
                <PartBadge
                  badge={BADGES[part]}
                  on={
                    part === "cloud"
                      ? selected === "cloud" || hot.has("cloud")
                      : selected === part
                  }
                />
              </g>
            </g>
          ))}
          {[...placed.tags.values()].map((tag) => (
            <PieceTag
              key={tag.id}
              tag={tag}
              unitsPerPx={unitsPerPx}
              on={focus === tag.part}
              quiet={pickedPart === tag.part && picked !== tag.id}
              register={register}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
