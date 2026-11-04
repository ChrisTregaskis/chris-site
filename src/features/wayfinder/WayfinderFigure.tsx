import { type ReactNode, type Ref, useEffect, useRef } from "react";
import {
  type Detail,
  DRAW_ITEMS,
  facesOf,
  itemKey,
  PLATE,
  PLATE_PIECE,
  PLATE_TAG,
  type SubComponent,
  SUBS,
  tagOf,
} from "./explode";
import {
  AI_BADGE,
  type Badge,
  type BoxFaces,
  FIGURE,
  type Point,
  type RouteKey,
  ROUTE_KEYS,
  routePath,
  VIEW_BOX,
} from "./iso";
import { PART_ORDER, type PartId, type PlatformIndex } from "./parts";
import { useExplode } from "./useExplode";
import { cn } from "@/lib/cn";

interface FaceState {
  base?: boolean;
  on: boolean;
  hot: boolean;
  /** The live AI platform cartridge. */
  live?: boolean;
  /** Another part is selected: a quieter, still opaque, palette. */
  dim?: boolean;
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
  if (state.on) return ON[face];
  if (state.base) return BASE_OFF[face];
  if (state.hot) return OFF[face];
  return state.dim ? DIM[face] : OFF[face];
}

function strokeFor(state: FaceState): string {
  if (state.live) return "stroke-ink";
  if (state.hot) return "stroke-signal";
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
                className={cn(LABEL, on && "fill-on-accent")}
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

const TAG_LEAD = 26;

/** A piece's number, on a short lead off the side of it. */
function PieceTag({
  id,
  at,
  way,
  on,
  register,
}: {
  id: string;
  at: Point;
  way: Point;
  on: boolean;
  register?: (node: SVGGElement | null) => void;
}) {
  const [x, y] = at;
  const ex = x + way[0] * TAG_LEAD;
  const ey = y + way[1] * TAG_LEAD;
  const anchor =
    Math.abs(way[0]) < 0.3 ? "middle" : way[0] > 0 ? "start" : "end";
  return (
    <g ref={register} style={{ opacity: 0 }} className="pointer-events-none">
      <circle
        cx={x}
        cy={y}
        r={3}
        className={on ? "fill-accent" : "fill-muted"}
      />
      <line
        x1={x}
        y1={y}
        x2={ex}
        y2={ey}
        className={cn("stroke-1", on ? "stroke-accent" : "stroke-muted/60")}
      />
      <text
        x={ex + way[0] * 4}
        y={ey + (way[1] < -0.8 ? -10 : way[1] * 10)}
        textAnchor={anchor}
        dominantBaseline="central"
        className={cn(
          "font-body text-[19px] font-semibold tabular-nums [paint-order:stroke] stroke-surface stroke-[5px] [stroke-linejoin:round]",
          on ? "fill-accent" : "fill-muted",
        )}
      >
        {id}
      </text>
    </g>
  );
}

/** A piece, or an AI platform cartridge (which lifts unless it is live). */
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
      className={cn(
        "transition-transform duration-slow ease-lift motion-reduce:transition-none",
        cartridge !== platform && "-translate-y-[22px]",
      )}
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
const footprintOf = (sub: SubComponent) => {
  const floor = sub.boxes.filter((b) => b.z === 0);
  return floor.map((b) => {
    const faces = facesOf({ ...b, h: 0 });
    return faces.top;
  });
};

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
  /** PROTOTYPE: taken apart (the target state; the hook animates to it). */
  apart?: boolean;
  /** PROTOTYPE: phone-lite, only the part in focus comes apart. */
  lite?: boolean;
  reducedMotion?: boolean;
  /** PROTOTYPE: hands the hook's controls up (to wait for reassembly). */
  onExplode?: (controls: { whenAssembled: () => Promise<void> }) => void;
}

const BADGES: Record<PartId, Badge> = {
  chat: FIGURE.chat.badge,
  bff: FIGURE.bff.badge,
  sup: FIGURE.sup.badge,
  spec: FIGURE.spec.badge,
  adp: FIGURE.adp.badge,
  ai: AI_BADGE,
  mcp: FIGURE.mcp.badge,
  tools: FIGURE.tools.badge,
  cloud: FIGURE.cloud.badge,
};

/**
 * Wayfinder's architecture as an isometric figure (after the `anatomy` style):
 * nine numbered parts on a cloud base plate, joined by the pipes a message
 * travels. PROTOTYPE: it also comes apart into numbered pieces, each drawn
 * in a paint order re-sorted as they move. Decorative for assistive tech,
 * which uses the picker instead.
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
  reducedMotion = false,
  onExplode,
}: WayfinderFigureProps) {
  const { order, register, whenAssembled } = useExplode({
    apart,
    focus: apart ? selected : null,
    lite,
    platform,
    reducedMotion,
  });
  const onExplodeRef = useRef(onExplode);
  onExplodeRef.current = onExplode;
  useEffect(() => {
    onExplodeRef.current?.({ whenAssembled });
  }, [whenAssembled]);

  const plateOn = selected === "cloud";
  const plateHot = hot.has("cloud");

  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label="Wayfinder's architecture as nine parts on a cloud base plate. Use the part picker below to explore each part."
      className="block h-auto w-full overflow-visible wide:max-h-[66vh]"
    >
      <PartGroup id="cloud" selected={selected} hot={hot} onPart={onPart}>
        {(state) => <Faces faces={PLATE} state={{ ...state, base: true }} />}
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
          MCP) never paint over a lit one. Taken apart, they draw off. */}
      <g
        ref={register("pipes")}
        className="fill-none [stroke-linecap:round] [stroke-linejoin:round]"
      >
        {ROUTE_KEYS.map((key) => {
          const d = routePath(key);
          return (
            <g key={key}>
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
                selected === sub.part && apart
                  ? "stroke-accent"
                  : "stroke-accent/45",
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
                  state={state}
                  platform={platform}
                  onSlot={onSlot}
                />
              </g>
            )}
          </PartGroup>
        );
      })}

      <g
        ref={pulseRef}
        transform="translate(-999,-999)"
        visibility="hidden"
        aria-hidden="true"
      >
        <circle r={13} className="fill-signal opacity-25" />
        <circle r={6} className="fill-signal" />
      </g>

      {/* Numbers float above everything: the parts' badges and, taken apart,
          each piece's own. */}
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
            <PartBadge
              badge={BADGES[part]}
              on={part === "cloud" ? plateOn || plateHot : selected === part}
            />
          </g>
        ))}
        {SUBS.map((sub) => (
          <PieceTag
            key={sub.id}
            id={sub.id}
            {...tagOf(sub)}
            on={apart && selected === sub.part}
            register={register(`tag:${sub.id}`)}
          />
        ))}
        <PieceTag
          id={PLATE_PIECE.id}
          {...PLATE_TAG}
          on
          register={register(`tag:${PLATE_PIECE.id}`)}
        />
      </g>
    </svg>
  );
}
