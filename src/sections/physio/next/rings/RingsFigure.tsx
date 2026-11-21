import { type Ref, useId, useRef } from "react";
import { type RingStroke, type StrokeKey } from "./draw";
import {
  arcPath,
  HALF,
  LABELS,
  NODES,
  type NodeId,
  nodeRadius,
  R,
  RING_LABELS,
  type RouteKey,
  ROUTE_KEYS,
  routePath,
  VIEW_BOX,
} from "./geometry";
import { type GlyphId, GLYPH_STROKE, GlyphPaths } from "./glyphs";
import { type TokenState } from "./journeys";
import {
  NODE_STEP,
  type Reveal,
  revealAt,
  RING_STEP,
  type RingId,
} from "./story";
import { useDrawOn } from "./useDrawOn";
import { cn } from "@/lib/cn";

export interface Highlight {
  nodes: ReadonlySet<NodeId>;
  routes: ReadonlySet<RouteKey>;
  rings: ReadonlySet<RingId>;
}

export const NO_HIGHLIGHT: Highlight = {
  nodes: new Set(),
  routes: new Set(),
  rings: new Set(),
};

interface RingsFigureProps {
  /** The step in view (1-based; 0 before the first). */
  current: number;
  /** Everything drawn at once (static, under reduced motion). */
  all: boolean;
  /** Picked out from a step's details. */
  highlight: Highlight;
  /** A journey under way: nodes lit, nodes holding the line, routes lit, the queue's token. */
  hot: ReadonlySet<NodeId>;
  held: ReadonlySet<NodeId>;
  lit: ReadonlySet<RouteKey>;
  token: TokenState | null;
  pulseRef: Ref<SVGGElement>;
  /** A node pressed: show its step. */
  onNode: (id: NodeId) => void;
}

const ICON: Partial<Record<NodeId, GlyphId>> = {
  visitor: "person",
  admin: "eye",
  schedule: "clock",
  api: "door",
  signIn: "badge",
  cdn: "globe",
  storage: "film",
  fnRequest: "code",
  fnVideo: "key",
  fnHealth: "pulse",
  runner: "loop",
  sweeper: "broom",
  host: "server",
  gate: "lock",
  noRoute: "blocked",
};

/** How each route is drawn when it isn't lit: by what travels it. */
const ROUTE_LOOK: Record<RouteKey, string | null> = {
  "visitor-api": "stroke-accent stroke-[4]",
  "api-fn": "stroke-accent stroke-[4]",
  "fn-data": "stroke-accent stroke-[4]",
  // Part of fn-data: drawn only when lit.
  "fn-policy": null,
  "visitor-cdn": "stroke-tenant-teal stroke-[4]",
  "cdn-storage": "stroke-tenant-teal stroke-[4]",
  "visitor-signIn": "stroke-muted stroke-[2.5]",
  "fn-video": "stroke-line-strong stroke-[2.5]",
  "fn-signIn": "stroke-line-strong stroke-[2.5]",
  "fn-storage": "stroke-line-strong stroke-[2.5]",
  "schedule-runner": "stroke-muted stroke-[2] [stroke-dasharray:5_5]",
  "schedule-sweeper": "stroke-muted stroke-[2] [stroke-dasharray:5_5]",
  "runner-data": "stroke-line-strong stroke-[2.5]",
  "sweeper-data": "stroke-line-strong stroke-[2.5]",
  "admin-host": "stroke-muted stroke-[2.5] [stroke-dasharray:7_6]",
  "host-data": "stroke-muted stroke-[2.5] [stroke-dasharray:7_6]",
  "fn-noRoute": "stroke-danger stroke-[2] [stroke-dasharray:2_6]",
};

const COLOUR =
  "transition-[stroke,fill,color] duration-base motion-reduce:transition-none";
const TYPE = "font-body text-[17.5px] sheet:text-[14px] xl:text-[12.5px]";
const TONE = "fill-surface";

/*
 * Drawn on as the steps pass (`useDrawOn`): until then, a line's mask is
 * undrawn and anything that fades is see-through and can't be pressed.
 * These are only where they start; the driver writes over them. Static,
 * everything is drawn from the first paint.
 */
const UNDRAWN = { strokeDasharray: "1 1", strokeDashoffset: 1 } as const;
const UNSHOWN = { opacity: 0, pointerEvents: "none" } as const;

/** A drawn line's mask: a wide stroke that draws on along the line's path. */
const maskId = (ids: string, key: StrokeKey) =>
  `${ids}-draw-${key.replace(":", "-")}`;

/** A ring as a path from twelve o'clock, clockwise, so it draws on round. */
const ringPath = (r: number) =>
  `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r}`;

const RING_STROKES: { key: RingStroke; r: number; width: number }[] = [
  { key: "ring:net", r: R.net, width: 8 },
  { key: "ring:orbit", r: R.orbit, width: 20 },
  { key: "ring:policy", r: R.policy, width: 10 },
];

interface NodeLook {
  reveal: Reveal;
  hot: boolean;
  held: boolean;
}

function ringClass({ reveal, hot, held }: NodeLook): string {
  if (held) return "stroke-danger";
  if (hot) return "stroke-signal";
  if (reveal === "new") return "stroke-accent";
  return "stroke-line-strong";
}

function iconClass({ reveal, hot, held }: NodeLook): string {
  if (held) return "text-danger";
  if (hot) return "text-signal";
  if (reveal === "new") return "text-ink";
  return "text-muted";
}

/**
 * The rings, drawn from above: revealed ring by ring as the steps pass, with
 * the step in view lit in lilac, anything picked out in amber, and a
 * journey's route lit in amber behind its pulse (red where a wall holds).
 * Decorative to assistive tech beyond its description: every node's part is
 * named in the step cards, which are the keyboard route.
 */
export function RingsFigure({
  current,
  all,
  highlight,
  hot,
  held,
  lit,
  token,
  pulseRef,
  onNode,
}: RingsFigureProps) {
  const ids = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  useDrawOn(svgRef, current, all);
  const unshown = all ? undefined : UNSHOWN;
  const masked = (key: StrokeKey) => `url(#${maskId(ids, key)})`;
  const nodeReveal = (id: NodeId) => revealAt(NODE_STEP.get(id), current, all);
  const ringReveal = (id: RingId) => revealAt(RING_STEP.get(id), current, all);
  const look = (id: NodeId): NodeLook => ({
    reveal: nodeReveal(id),
    hot: hot.has(id) || highlight.nodes.has(id),
    held: held.has(id),
  });
  const ringLabelReveal = {
    net: ringReveal("net"),
    orbit: revealAt(NODE_STEP.get("fnRequest"), current, all),
    policy: ringReveal("policy"),
  } as const;
  const policy = look("policy");
  const policyHot = policy.hot || highlight.rings.has("policy");
  const data = look("data");
  const tokensHot = highlight.rings.has("tokens");

  const press = (id: NodeId) => () => onNode(id);

  const disc = (id: NodeId, filled = false) => {
    const node = NODES[id];
    const state = look(id);
    const r = nodeRadius(node.kind);
    const icon = ICON[id];
    const size = r * 1.15;
    return (
      <g
        key={id}
        data-node={id}
        data-reveal={state.reveal}
        data-hot={state.hot ? "" : undefined}
        data-draw={id}
        style={unshown}
        onClick={press(id)}
        className="cursor-pointer"
      >
        <circle
          cx={node.at[0]}
          cy={node.at[1]}
          r={r}
          strokeWidth={state.hot || state.held ? 2.5 : 1.75}
          className={cn(
            COLOUR,
            filled ? "fill-ink" : TONE,
            filled && !state.hot && !state.held
              ? "stroke-ink"
              : ringClass(state),
          )}
        />
        {icon ? (
          <g
            transform={`translate(${node.at[0] - size / 2} ${node.at[1] - size / 2}) scale(${size / 24})`}
            className={cn(COLOUR, filled ? "text-surface" : iconClass(state))}
          >
            <g {...GLYPH_STROKE} strokeWidth={2.2}>
              <GlyphPaths id={icon} />
            </g>
          </g>
        ) : null}
      </g>
    );
  };

  /** A private endpoint: a pill set into the wall, along the spoke through it. */
  const endpoint = (id: NodeId) => {
    const node = NODES[id];
    const state = look(id);
    const [x, y] = node.at;
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    return (
      <g
        key={id}
        data-node={id}
        data-reveal={state.reveal}
        data-draw={id}
        style={unshown}
        onClick={press(id)}
        className="cursor-pointer"
      >
        <rect
          x={x - 10}
          y={y - 5.5}
          width={20}
          height={11}
          rx={5.5}
          transform={`rotate(${angle} ${x} ${y})`}
          strokeWidth={2}
          className={cn(COLOUR, TONE, ringClass(state))}
        />
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox={VIEW_BOX}
      role="img"
      aria-label="The platform from above, as rings round the data: the visitor and the admin outside; the API, the CDN, sign-in and video storage at the edge; the functions on an orbit inside a private network with no way out; and Postgres at the centre, inside its row-level security policy, holding the job queue."
      data-testid="rings-figure"
      className="block h-auto w-full overflow-visible"
    >
      <defs>
        {/* What draws each line on: masks whose strokes draw along it */}
        {ROUTE_KEYS.filter((key) => ROUTE_LOOK[key]).map((key) => (
          <mask
            key={key}
            id={maskId(ids, key)}
            maskUnits="userSpaceOnUse"
            x={-HALF}
            y={-HALF}
            width={HALF * 2}
            height={HALF * 2}
          >
            <path
              d={routePath(key)}
              pathLength={1}
              data-draw={key}
              style={all ? undefined : UNDRAWN}
              className="fill-none stroke-white stroke-[16] [stroke-linecap:butt] [stroke-linejoin:round]"
            />
          </mask>
        ))}
        {RING_STROKES.map((ring) => (
          <mask
            key={ring.key}
            id={maskId(ids, ring.key)}
            maskUnits="userSpaceOnUse"
            x={-HALF}
            y={-HALF}
            width={HALF * 2}
            height={HALF * 2}
          >
            <path
              d={ringPath(ring.r)}
              pathLength={1}
              data-draw={ring.key}
              style={all ? undefined : UNDRAWN}
              strokeWidth={ring.width}
              className="fill-none stroke-white [stroke-linecap:butt]"
            />
          </mask>
        ))}
        {RING_LABELS.map((ring) => (
          <path
            key={ring.id}
            id={`${ids}-${ring.id}`}
            d={arcPath(ring.r, ring.from, ring.to)}
          />
        ))}
      </defs>

      {/* The rings' ghosts: the shape is there before anything is in it. */}
      <g
        aria-hidden="true"
        className="fill-none stroke-line [stroke-dasharray:2_6]"
      >
        {[R.edge, R.net, R.orbit, R.policy, R.data].map((r) => (
          <circle key={r} cx={0} cy={0} r={r} strokeWidth={1.25} />
        ))}
      </g>

      {/* The private network: a tinted wall with the orbit inside it */}
      <g data-ring="net" data-reveal={ringReveal("net")}>
        <circle
          cx={0}
          cy={0}
          r={R.net}
          data-draw="net-fill"
          style={unshown}
          className="fill-tenant-teal/[0.08] stroke-none"
        />
        <circle
          cx={0}
          cy={0}
          r={R.net}
          strokeWidth={1.75}
          mask={masked("ring:net")}
          className={cn(
            COLOUR,
            "fill-none",
            ringReveal("net") === "new"
              ? "stroke-tenant-teal"
              : "stroke-tenant-teal/45",
          )}
        />
        <circle
          cx={0}
          cy={0}
          r={R.orbit}
          strokeWidth={13}
          mask={masked("ring:orbit")}
          className="fill-none stroke-line/45"
        />
      </g>

      {/* The policy: a dashed ring round the data */}
      <g
        data-ring="policy"
        data-held={policy.held ? "" : undefined}
        data-draw="policy"
        style={unshown}
        onClick={press("policy")}
        className="cursor-pointer"
      >
        <circle
          cx={0}
          cy={0}
          r={R.policy}
          mask={masked("ring:policy")}
          strokeWidth={policy.held ? 3.5 : policyHot ? 2.75 : 2}
          className={cn(
            COLOUR,
            "fill-none [stroke-dasharray:6_5]",
            policy.held
              ? "stroke-danger"
              : policyHot
                ? "stroke-signal"
                : "stroke-accent",
          )}
        />
      </g>

      {/* Routes: each in the colour of what travels it */}
      <g className="fill-none [stroke-linecap:round] [stroke-linejoin:round]">
        {ROUTE_KEYS.map((key) => {
          const style = ROUTE_LOOK[key];
          if (!style) return null;
          return (
            <path
              key={key}
              d={routePath(key)}
              data-route={key}
              mask={masked(key)}
              className={style}
            />
          );
        })}
        {/* Lit routes on top, drawn on behind a journey's pulse */}
        {ROUTE_KEYS.map((key) => {
          const on = lit.has(key) || highlight.routes.has(key);
          return (
            <path
              key={key}
              d={routePath(key)}
              data-lit-route={key}
              pathLength={1}
              className={cn(
                "stroke-signal stroke-[4.5] transition-opacity duration-state motion-reduce:transition-none",
                on ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}
      </g>

      {/* The ring labels, one inside the next along the bottom */}
      <g aria-hidden="true">
        {RING_LABELS.map((ring) => (
          <text
            key={ring.id}
            data-draw={`label:${ring.id}`}
            data-reveal={ringLabelReveal[ring.id]}
            style={unshown}
            className={cn(
              TYPE,
              ring.id === "policy" ? "fill-accent" : "fill-muted",
            )}
          >
            <textPath
              href={`#${ids}-${ring.id}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {ring.text}
            </textPath>
          </text>
        ))}
      </g>

      {/* Postgres, with its queue */}
      <g
        data-node="data"
        data-reveal={data.reveal}
        data-draw="data"
        style={unshown}
        onClick={press("data")}
        className="cursor-pointer"
      >
        <circle
          cx={0}
          cy={0}
          r={R.data}
          strokeWidth={data.held || data.hot ? 2.75 : 2}
          className={cn(
            COLOUR,
            "fill-raised",
            data.held
              ? "stroke-danger"
              : data.hot
                ? "stroke-signal"
                : "stroke-ink",
          )}
        />
        <text
          x={0}
          y={-2}
          textAnchor="middle"
          className={cn(TYPE, "fill-ink font-semibold")}
        >
          Postgres
        </text>
        <g
          data-ring="tokens"
          data-token={token ?? undefined}
          data-reveal={ringReveal("tokens")}
          data-draw="tokens"
          style={unshown}
        >
          {[-26, -7, 12].map((x, i) => {
            const mine = i === 2 ? token : null;
            return (
              <rect
                key={x}
                x={x}
                y={11}
                width={14}
                height={9}
                rx={2.5}
                strokeWidth={1.5}
                className={cn(
                  COLOUR,
                  mine === "claimed"
                    ? "fill-signal stroke-signal"
                    : mine === "done"
                      ? "fill-accent stroke-accent"
                      : mine === "queued"
                        ? "fill-none stroke-signal"
                        : tokensHot
                          ? "fill-signal/30 stroke-signal"
                          : "fill-line-strong/60 stroke-line-strong",
                )}
              />
            );
          })}
        </g>
      </g>

      {/* Walls: private endpoints, the admin's gate, the way out that isn't there */}
      {endpoint("endpointSignIn")}
      {endpoint("endpointStorage")}
      {disc("gate")}
      {disc("noRoute")}

      {/* Functions on the orbit, and the admin's private host */}
      {(
        [
          "fnRequest",
          "fnVideo",
          "fnHealth",
          "runner",
          "sweeper",
          "host",
        ] as const
      ).map((id) => disc(id))}

      {/* The edge */}
      {(["api", "signIn", "cdn", "storage"] as const).map((id) => disc(id))}

      {/* Outside: the people, and the schedule */}
      {(["visitor", "admin", "schedule"] as const).map((id) => disc(id, true))}

      {/* Labels beside the outer nodes */}
      <g aria-hidden="true">
        {LABELS.map((label) => (
          <text
            key={label.node}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            data-draw={label.node}
            style={unshown}
            className={cn(TYPE, "pointer-events-none fill-ink font-semibold")}
          >
            {label.lines.map((line, i) => (
              <tspan key={line} x={label.x} dy={i === 0 ? 0 : "1.1em"}>
                {line}
              </tspan>
            ))}
          </text>
        ))}
      </g>

      {/* A journey's pulse */}
      <g
        ref={pulseRef}
        aria-hidden="true"
        transform="translate(-999,-999)"
        visibility="hidden"
        className="pointer-events-none"
      >
        <circle r={12} className="fill-signal opacity-25" />
        <circle r={5.5} className="fill-signal" />
      </g>
    </svg>
  );
}
