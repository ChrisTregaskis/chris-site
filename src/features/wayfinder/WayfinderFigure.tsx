import { type ReactNode, type Ref } from "react";
import {
  AI_BADGE,
  type Badge,
  type BoxFaces,
  FIGURE,
  type FigurePart,
  ROUTE_KEYS,
  type RouteKey,
  routePath,
  SLOTS,
  VIEW_BOX,
} from "./iso";
import { type PartId, type PlatformIndex } from "./parts";
import { cn } from "@/lib/cn";

interface FaceState {
  base?: boolean;
  on: boolean;
  hot: boolean;
  /** The live AI platform cartridge. */
  live?: boolean;
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
  return state.base ? BASE_OFF[face] : OFF[face];
}

function strokeFor(state: FaceState): string {
  if (state.live) return "stroke-ink";
  if (state.hot) return "stroke-signal";
  if (state.on) return "stroke-accent";
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
  const dimmed = selected !== null && !on && !isHot;
  return (
    <g
      data-part={id}
      onClick={() => onPart(id)}
      className={cn(
        "cursor-pointer transition-opacity duration-state motion-reduce:transition-none",
        dimmed && "opacity-60",
      )}
    >
      {children({ on, hot: isHot })}
    </g>
  );
}

function StaticPart({ part, state }: { part: FigurePart; state: FaceState }) {
  const full = { ...state, base: part.base };
  const stroke = strokeFor(full);
  return (
    <>
      {part.boxes.map((faces, index) => (
        <Faces key={index} faces={faces} state={full} />
      ))}
      {part.labels?.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          className={LABEL}
        >
          {label.text}
        </text>
      ))}
      {part.screens?.map((points) => (
        <polygon
          key={points}
          points={points}
          className={cn(SHAPE, "fill-none", stroke)}
        />
      ))}
      {part.eye ? (
        <ellipse
          cx={part.eye.cx}
          cy={part.eye.cy}
          rx={22}
          ry={11}
          className="fill-surface stroke-line-strong stroke-[1.2]"
        />
      ) : null}
      {part.sockets?.map((points) => (
        <polygon
          key={points}
          points={points}
          className={cn(SHAPE, "fill-surface", stroke)}
        />
      ))}
      <PartBadge badge={part.badge} on={state.on} />
    </>
  );
}

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
}

const PARTS_AFTER_AI = [
  "adp",
  "chat",
  "bff",
  "sup",
  "spec",
  "mcp",
  "tools",
] as const;

/**
 * Wayfinder's architecture as an isometric figure (after the `anatomy` style):
 * nine numbered parts on a cloud base plate, joined by the pipes a message
 * travels. Decorative for assistive tech, which uses the picker instead.
 */
export function WayfinderFigure({
  selected,
  hot,
  lit,
  platform,
  onPart,
  onSlot,
  pulseRef,
}: WayfinderFigureProps) {
  const group = (id: Exclude<PartId, "ai">) => (
    <PartGroup key={id} id={id} selected={selected} hot={hot} onPart={onPart}>
      {(state) => <StaticPart part={FIGURE[id]} state={state} />}
    </PartGroup>
  );

  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label="Wayfinder's architecture as nine parts on a cloud base plate. Use the part picker below to explore each part."
      className="block h-auto w-full overflow-visible wide:max-h-[66vh]"
    >
      {group("cloud")}
      <g>
        {ROUTE_KEYS.map((key) => {
          const d = routePath(key);
          return (
            <g
              key={key}
              className="fill-none [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d={d} className="stroke-line-strong stroke-[5]" />
              <path d={d} className="stroke-surface stroke-[2.4]" />
              <path
                d={d}
                data-route={key}
                className={cn(
                  "stroke-signal stroke-[2.6] transition-opacity duration-state motion-reduce:transition-none",
                  lit.has(key) ? "opacity-100" : "opacity-0",
                )}
              />
            </g>
          );
        })}
      </g>
      <PartGroup id="ai" selected={selected} hot={hot} onPart={onPart}>
        {(state) => (
          <>
            {SLOTS.map((slot) => {
              const live = slot.platform === platform;
              return (
                <g
                  key={slot.label.text}
                  data-slot={slot.label.text}
                  onClick={() => onSlot(slot.platform)}
                  className={cn(
                    "transition-transform duration-slow ease-lift motion-reduce:transition-none",
                    !live && "-translate-y-[22px]",
                  )}
                >
                  <Faces faces={slot.face} state={{ ...state, live }} />
                  <text
                    x={slot.label.x}
                    y={slot.label.y}
                    textAnchor="middle"
                    className={LABEL}
                  >
                    {slot.label.text}
                  </text>
                </g>
              );
            })}
            <PartBadge badge={AI_BADGE} on={state.on} />
          </>
        )}
      </PartGroup>
      {PARTS_AFTER_AI.map(group)}
      <g ref={pulseRef} transform="translate(-999,-999)" aria-hidden="true">
        <circle r={13} className="fill-signal opacity-25" />
        <circle r={6} className="fill-signal" />
      </g>
    </svg>
  );
}
