/**
 * PROTOTYPE: the Wayfinder anatomy as a true 3D model, in vanilla three.js.
 * Loaded lazily (this module and three itself are one dynamic chunk) and
 * built procedurally from the same plan-space data as the isometric SVG: no
 * models, no textures. Flat face tones from the figure tokens, crisp edge
 * lines, an orthographic camera that starts exactly on the SVG's isometric
 * angle, so the assembled board reads as the same drawing until you turn it.
 *
 * It renders on demand: nothing runs while nothing moves, or while the canvas
 * is off screen.
 */
import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  type Block,
  blockBounds,
  type Bounds,
  EXPLODED,
  type ExplodedPart,
  type SubComponent,
  subOffset,
  type Vec3,
} from "../exploded";
import { iso, ROUTE_KEYS, ROUTES, type RouteKey, VIEW_BOX } from "../iso";
import { type PartId, type PlatformIndex } from "../parts";
import {
  AZIMUTH_RANGE,
  clamp,
  cubicBezier,
  ELEVATION_RANGE,
  fitFrustum,
  ISO_AZIMUTH,
  ISO_ELEVATION,
  smoothing,
} from "./camera";
import { pointAlong, polylineLength } from "@/lib/polyline";
import { DURATION, EASE, STAGGER } from "@/ui/tokens/motion";

export interface SceneState {
  selected: PartId | null;
  exploded: boolean;
  hot: ReadonlySet<PartId>;
  lit: ReadonlySet<RouteKey>;
  platform: PlatformIndex;
}

export interface SceneOptions {
  /** Positioned element the canvas and its labels fill. */
  host: HTMLElement;
  /** The SVG figure, whose box the assembled board lines up with. */
  svg: SVGSVGElement;
  reducedMotion: boolean;
  initial: SceneState;
  onPart: (id: PartId) => void;
  onSlot: (platform: PlatformIndex) => void;
  /** Called once the first frame is on screen. */
  onReady: () => void;
  /** Whether the view is turned away from the default angle. */
  onRotated: (rotated: boolean) => void;
  /** WebGL went away: fall back to the SVG. */
  onLost: () => void;
}

export interface WayfinderScene {
  update: (state: SceneState) => void;
  /** The demo's travelling message: where it is, or null when parked. */
  pulse: (route: RouteKey | null, reverse?: boolean, progress?: number) => void;
  resetView: () => void;
  dispose: () => void;
}

type RGB = [number, number, number];

const PIPE_HEIGHT = 3;
const PIPE_WIDTH = 5;
const LEAD = 38;
/** The board's centre in plan space: what the camera turns around. */
const PIVOT: Vec3 = [250, 55, 0];

/** Zoom while apart, leaving room above the board for the lifted parts. */
const EXPLODED_ZOOM = 0.9;

/**
 * Per part, how the camera turns (degrees of azimuth, elevation) from the
 * isometric angle while that part is being read: side-on to see the chat's
 * layers part, lower to see between stacked layers, higher for the plate.
 */
const STORY_VIEWS: Partial<Record<PartId, readonly [number, number]>> = {
  chat: [14, -4],
  bff: [-10, -12],
  sup: [10, -12],
  spec: [-16, 4],
  adp: [14, -10],
  ai: [-22, -4],
  mcp: [-12, -10],
  tools: [16, 0],
  cloud: [-8, 6],
};

/** Plan (x right-down, y left-down, z up) to three's y-up world. */
const world = (x: number, y: number, z: number) => new Vector3(x, z, y);

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function token(name: string): RGB {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim()
    .split(/\s+/)
    .map(Number);
  return [value[0] / 255, value[1] / 255, value[2] / 255];
}

function readPalette() {
  return {
    top: token("figure-top"),
    left: token("figure-left"),
    right: token("figure-right"),
    onLeft: token("figure-on-left"),
    baseTop: token("panel"),
    baseLeft: token("figure-base-left"),
    baseRight: token("figure-base-right"),
    baseOn: token("figure-base-on"),
    accent: token("accent"),
    accentStrong: token("accent-strong"),
    signal: token("signal"),
    ink: token("ink"),
    surface: token("surface"),
    line: token("line"),
    lineStrong: token("line-strong"),
    tone: token("tone-wayfinder"),
  };
}
type Palette = ReturnType<typeof readPalette>;

const FACE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying float vHeight;
  void main() {
    vNormal = normal;
    vHeight = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Flat tones by face, like the drawing: the top, the y-facing sides (the
 * drawing's left faces) and the x-facing sides (its right faces), with a
 * faint fall-off towards the foot of each side so stacked pieces separate.
 */
const FACE_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uLeft;
  uniform vec3 uRight;
  varying vec3 vNormal;
  varying float vHeight;
  void main() {
    vec3 n = normalize(vNormal);
    float foot = mix(0.82, 1.0, vHeight);
    vec3 colour;
    if (n.y > 0.5) colour = uTop;
    else if (n.y < -0.5) colour = uRight * 0.7;
    else if (abs(n.z) > 0.5) colour = uLeft * foot;
    else colour = uRight * foot;
    gl_FragColor = vec4(colour, 1.0);
  }
`;

const PIPE_VERTEX = /* glsl */ `
  attribute float along;
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    vNormal = normal;
    vAlong = along;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** A pipe lights up to `uDraw` along its route (the line drawing on). */
const PIPE_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uSide;
  uniform vec3 uLitTop;
  uniform vec3 uLitSide;
  uniform float uLit;
  uniform float uDraw;
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    float lit = uLit * step(vAlong, uDraw);
    bool top = normalize(vNormal).y > 0.5;
    vec3 off = top ? uTop : uSide;
    vec3 on = top ? uLitTop : uLitSide;
    gl_FragColor = vec4(mix(off, on, lit), 1.0);
  }
`;

interface Tween {
  from: number;
  to: number;
  start: number;
  duration: number;
  ease: (t: number) => number;
}

const tween = (value: number): Tween => ({
  from: value,
  to: value,
  start: 0,
  duration: 0,
  ease: (t) => t,
});

function tweenValue(t: Tween, now: number): number {
  if (t.duration <= 0) return now >= t.start ? t.to : t.from;
  const progress = clamp((now - t.start) / t.duration, 0, 1);
  return t.from + (t.to - t.from) * t.ease(progress);
}

const tweenDone = (t: Tween, now: number) => now >= t.start + t.duration;

function retarget(
  t: Tween,
  to: number,
  now: number,
  delay: number,
  duration: number,
  ease: (t: number) => number,
) {
  if (t.to === to) return;
  t.from = tweenValue(t, now);
  t.to = to;
  t.start = now + delay;
  t.duration = duration;
  t.ease = ease;
}

/** A value that eases exponentially towards its target. */
interface Smooth {
  value: number;
  target: number;
}

function stepSmooth(s: Smooth, k: number): boolean {
  if (s.value === s.target) return false;
  s.value += (s.target - s.value) * k;
  if (Math.abs(s.target - s.value) < 0.002) s.value = s.target;
  return true;
}

interface SubRuntime {
  data: SubComponent;
  part: PartRuntime;
  group: Group;
  bounds: Bounds;
  faces: ShaderMaterial;
  insets: ShaderMaterial;
  edges: LineBasicMaterial;
  axis: Line;
  live: Smooth;
  seat: Tween;
  tag?: HTMLElement;
  label: HTMLElement;
  leader: SVGLineElement;
  dot: SVGCircleElement;
}

interface PartRuntime {
  data: ExplodedPart;
  subs: SubRuntime[];
  explode: Tween;
  focus: Tween;
  on: Smooth;
  hot: Smooth;
  dim: Smooth;
  hover: Smooth;
  badge: HTMLElement;
  badgeSub?: SubRuntime;
  lead: Line;
  seats: LineSegments[];
}

interface RouteRuntime {
  key: RouteKey;
  points: [number, number][];
  length: number;
  material: ShaderMaterial;
  lit: Smooth;
  /** Waiting for the pulse to draw it on. */
  drawing: boolean;
}

const easeLift = cubicBezier(...EASE.lift);
const easeEnter = cubicBezier(...EASE.enter);

export function createWayfinderScene(options: SceneOptions): WayfinderScene {
  const { host, svg, reducedMotion } = options;
  const palette: Palette = readPalette();
  let state = options.initial;

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.className =
    "absolute inset-0 block h-full w-full cursor-grab touch-pan-y select-none";
  host.appendChild(canvas);

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className =
    "pointer-events-none absolute inset-0 select-none font-body";
  const leaders = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  leaders.setAttribute(
    "class",
    "absolute inset-0 h-full w-full overflow-visible",
  );
  overlay.appendChild(leaders);
  host.appendChild(overlay);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 6000);

  const unitBox = new BoxGeometry(1, 1, 1);
  const unitBoxEdges = new EdgesGeometry(unitBox);
  const unitDisc = new CylinderGeometry(1, 1, 1, 48);
  const unitDiscEdges = new EdgesGeometry(unitDisc, 30);
  const disposables: { dispose: () => void }[] = [
    unitBox,
    unitBoxEdges,
    unitDisc,
    unitDiscEdges,
  ];
  const track = <T extends { dispose: () => void }>(thing: T) => {
    disposables.push(thing);
    return thing;
  };

  const faceMaterial = () =>
    track(
      new ShaderMaterial({
        vertexShader: FACE_VERTEX,
        fragmentShader: FACE_FRAGMENT,
        uniforms: {
          uTop: { value: new Vector3() },
          uLeft: { value: new Vector3() },
          uRight: { value: new Vector3() },
        },
        // Faces sit a hair behind their edge lines, so the lines stay crisp.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    );

  const setRGB = (target: Vector3, rgb: RGB) =>
    target.set(rgb[0], rgb[1], rgb[2]);
  const setLineColour = (material: LineBasicMaterial, rgb: RGB) =>
    material.color.setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);

  const pickables: Mesh[] = [];

  function addBlock(
    parent: Group,
    block: Block,
    faces: ShaderMaterial,
    edges: LineBasicMaterial,
    sub: SubRuntime,
  ) {
    const disc = block.kind === "disc";
    const mesh = new Mesh(disc ? unitDisc : unitBox, faces);
    const lines = new LineSegments(disc ? unitDiscEdges : unitBoxEdges, edges);
    if (disc) {
      mesh.scale.set(block.w, block.h, block.w);
      mesh.position.copy(world(block.x, block.y, block.z + block.h / 2));
    } else {
      mesh.scale.set(block.w, block.h, block.d);
      mesh.position.copy(
        world(
          block.x + block.w / 2,
          block.y + block.d / 2,
          block.z + block.h / 2,
        ),
      );
    }
    lines.scale.copy(mesh.scale);
    lines.position.copy(mesh.position);
    mesh.userData.sub = sub;
    parent.add(mesh, lines);
    pickables.push(mesh);
  }

  function dashed(points: Vector3[], dash: number, gap: number, rgb: RGB) {
    const geometry = track(new BufferGeometry().setFromPoints(points));
    const material = track(
      new LineDashedMaterial({
        dashSize: dash,
        gapSize: gap,
        transparent: true,
        opacity: 0,
      }),
    );
    material.color.setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);
    const line = new Line(geometry, material);
    line.computeLineDistances();
    return line;
  }

  function overlayEl(className: string, text = "") {
    const element = document.createElement("div");
    element.className = className;
    element.textContent = text;
    overlay.appendChild(element);
    return element;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- Parts ----------
  const parts: PartRuntime[] = [];
  const partById = {} as Record<PartId, PartRuntime>;

  for (const data of EXPLODED) {
    const group = new Group();
    scene.add(group);
    const part: PartRuntime = {
      data,
      subs: [],
      explode: tween(0),
      focus: tween(0),
      on: { value: 0, target: 0 },
      hot: { value: 0, target: 0 },
      dim: { value: 0, target: 0 },
      hover: { value: 0, target: 0 },
      badge: overlayEl(
        "pointer-events-auto absolute left-0 top-0 grid cursor-pointer place-items-center rounded-full border-[1.3px] font-semibold leading-none transition-[background-color,border-color,color] duration-state motion-reduce:transition-none",
      ),
      lead: dashed(
        [new Vector3(), new Vector3(0, LEAD - 9, 0)],
        2,
        3,
        palette.lineStrong,
      ),
      seats: [],
    };
    part.badge.textContent = String(Number(data.subs[0].id.split(".")[0]));
    part.badge.addEventListener("click", () => options.onPart(data.id));
    (part.lead.material as LineDashedMaterial).opacity = 1;
    scene.add(part.lead);

    for (const subData of data.subs) {
      const subGroup = new Group();
      group.add(subGroup);
      const edges = track(new LineBasicMaterial());
      const leader = document.createElementNS(SVG_NS, "line");
      leader.setAttribute(
        "class",
        "stroke-line-strong opacity-0 transition-opacity duration-state motion-reduce:transition-none",
      );
      leader.setAttribute("stroke-width", "1");
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("r", "2.5");
      dot.setAttribute(
        "class",
        "fill-accent opacity-0 transition-opacity duration-state motion-reduce:transition-none",
      );
      leaders.append(leader, dot);
      const label = overlayEl(
        "absolute left-0 top-0 z-[1] whitespace-nowrap text-[13px] font-medium leading-none text-ink opacity-0 transition-opacity duration-state [text-shadow:0_0_2px_rgb(var(--color-tone-wayfinder)),0_0_4px_rgb(var(--color-tone-wayfinder)),0_0_8px_rgb(var(--color-tone-wayfinder)),0_0_12px_rgb(var(--color-tone-wayfinder))] motion-reduce:transition-none",
      );
      const number = document.createElement("span");
      number.className = "mr-[6px] font-semibold tabular-nums text-accent";
      number.textContent = subData.id;
      label.append(number, subData.label);

      const sub: SubRuntime = {
        data: subData,
        part,
        group: subGroup,
        bounds: blockBounds(subData.blocks),
        faces: faceMaterial(),
        insets: faceMaterial(),
        edges,
        axis: dashed(
          [new Vector3(), new Vector3(), new Vector3()],
          3,
          3,
          palette.lineStrong,
        ),
        live: { value: 0, target: 0 },
        seat: tween(0),
        label,
        leader,
        dot,
      };
      if (subData.tag) {
        sub.tag = overlayEl(
          "absolute left-0 top-0 whitespace-nowrap font-medium leading-none text-muted",
          subData.tag,
        );
      }
      scene.add(sub.axis);
      for (const block of subData.blocks) {
        addBlock(
          subGroup,
          block,
          block.kind === "inset" || block.kind === "disc"
            ? sub.insets
            : sub.faces,
          edges,
          sub,
        );
      }
      // Where it seats on the board, dashed, shown while it is lifted off.
      if (!data.base && sub.bounds.min[2] === 0) {
        const { min, max } = sub.bounds;
        const y = 0.4;
        const outline = [
          world(min[0], min[1], y),
          world(max[0], min[1], y),
          world(max[0], max[1], y),
          world(min[0], max[1], y),
        ];
        const geometry = track(
          new BufferGeometry().setFromPoints([
            outline[0],
            outline[1],
            outline[1],
            outline[2],
            outline[2],
            outline[3],
            outline[3],
            outline[0],
          ]),
        );
        const material = track(
          new LineDashedMaterial({
            dashSize: 4,
            gapSize: 3,
            transparent: true,
            opacity: 0,
          }),
        );
        setLineColour(material, palette.lineStrong);
        const seat = new LineSegments(geometry, material);
        seat.computeLineDistances();
        scene.add(seat);
        part.seats.push(seat);
      }
      part.subs.push(sub);
    }

    // The badge rides the piece its lead starts on.
    const [bx, by] = data.badgeAt;
    const contains = ({ bounds: { min, max } }: SubRuntime) =>
      bx >= min[0] && bx <= max[0] && by >= min[1] && by <= max[1];
    const centreDistance = ({ bounds: { min, max } }: SubRuntime) =>
      Math.hypot((min[0] + max[0]) / 2 - bx, (min[1] + max[1]) / 2 - by);
    part.badgeSub =
      part.subs
        .filter(contains)
        .sort((a, b) => b.bounds.max[2] - a.bounds.max[2])[0] ??
      [...part.subs].sort((a, b) => centreDistance(a) - centreDistance(b))[0];
    parts.push(part);
    partById[data.id] = part;
  }

  // ---------- Pipes ----------
  const pipes = new Group();
  scene.add(pipes);
  const pipeEdges = track(new LineBasicMaterial());
  setLineColour(pipeEdges, palette.lineStrong);
  const routes: RouteRuntime[] = ROUTE_KEYS.map((key) => {
    const points = ROUTES[key].map(([x, y]) => [x, y] as [number, number]);
    const material = track(
      new ShaderMaterial({
        vertexShader: PIPE_VERTEX,
        fragmentShader: PIPE_FRAGMENT,
        uniforms: {
          uTop: { value: setRGB(new Vector3(), palette.surface) },
          uSide: { value: setRGB(new Vector3(), palette.line) },
          uLitTop: { value: setRGB(new Vector3(), palette.signal) },
          uLitSide: {
            value: setRGB(
              new Vector3(),
              mix(palette.signal, palette.tone, 0.35),
            ),
          },
          uLit: { value: 0 },
          uDraw: { value: 1e6 },
        },
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    );
    let travelled = 0;
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1];
      const [bx, by] = points[i];
      const length = Math.hypot(bx - ax, by - ay);
      const alongX = Math.abs(bx - ax) > Math.abs(by - ay);
      const half = PIPE_WIDTH / 2;
      const minX = Math.min(ax, bx) - half;
      const minY = Math.min(ay, by) - half;
      const sizeX = alongX ? length + PIPE_WIDTH : PIPE_WIDTH;
      const sizeY = alongX ? PIPE_WIDTH : length + PIPE_WIDTH;
      const geometry = track(new BoxGeometry(sizeX, PIPE_HEIGHT, sizeY));
      geometry.translate(minX + sizeX / 2, PIPE_HEIGHT / 2, minY + sizeY / 2);
      const position = geometry.getAttribute("position");
      const along: number[] = [];
      const ux = (bx - ax) / (length || 1);
      const uy = (by - ay) / (length || 1);
      for (let v = 0; v < position.count; v++) {
        const t = (position.getX(v) - ax) * ux + (position.getZ(v) - ay) * uy;
        along.push(travelled + clamp(t, 0, length));
      }
      geometry.setAttribute("along", new Float32BufferAttribute(along, 1));
      const edges = track(new EdgesGeometry(geometry));
      pipes.add(
        new Mesh(geometry, material),
        new LineSegments(edges, pipeEdges),
      );
      travelled += length;
    }
    return {
      key,
      points,
      length: travelled,
      material,
      lit: { value: 0, target: 0 },
      drawing: false,
    };
  });
  const routeByKey = Object.fromEntries(
    routes.map((r) => [r.key, r]),
  ) as Record<RouteKey, RouteRuntime>;

  // ---------- The demo's travelling message ----------
  const pulseGroup = new Group();
  const pulseHalo = new Mesh(
    track(new CircleGeometry(13 * 0.8165, 32)),
    track(
      new MeshBasicMaterial({
        transparent: true,
        opacity: 0.25,
        depthTest: false,
      }),
    ),
  );
  const pulseDot = new Mesh(
    track(new CircleGeometry(6 * 0.8165, 32)),
    track(new MeshBasicMaterial({ depthTest: false })),
  );
  for (const mesh of [pulseHalo, pulseDot]) {
    mesh.material.color.setRGB(...palette.signal, SRGBColorSpace);
    mesh.renderOrder = 10;
  }
  pulseGroup.add(pulseHalo, pulseDot);
  pulseGroup.visible = false;
  scene.add(pulseGroup);

  // ---------- Camera ----------
  const view = {
    azimuth: ISO_AZIMUTH,
    elevation: ISO_ELEVATION,
    azimuthTarget: ISO_AZIMUTH,
    elevationTarget: ISO_ELEVATION,
    zoom: 1,
    zoomTarget: 1,
    pivot: world(...PIVOT),
    rotated: false,
    /** The visitor has turned it: story steps leave the angle alone. */
    manual: false,
    storyAzimuth: ISO_AZIMUTH,
    storyElevation: ISO_ELEVATION,
  };
  const pivotIso = iso(...PIVOT);
  const viewBox = VIEW_BOX.split(" ").map(Number) as [
    number,
    number,
    number,
    number,
  ];
  let width = 1;
  let height = 1;
  /** Screen px per plan unit at zoom 1 (the SVG's scale). */
  let unitPx = 0.6;

  function fit() {
    const hostRect = host.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    // Not laid out yet (or hidden): keep the last good fit.
    if (!hostRect.width || !hostRect.height || !svgRect.width) return;
    width = Math.max(1, hostRect.width);
    height = Math.max(1, hostRect.height);
    renderer.setSize(width, height, false);
    const frustum = fitFrustum(hostRect, svgRect, viewBox, pivotIso);
    camera.left = frustum.left;
    camera.right = frustum.right;
    camera.top = frustum.top;
    camera.bottom = frustum.bottom;
    unitPx = Math.min(svgRect.width / viewBox[2], svgRect.height / viewBox[3]);
  }

  function placeCamera() {
    const cosE = Math.cos(view.elevation);
    camera.position.set(
      view.pivot.x + 2000 * cosE * Math.sin(view.azimuth),
      view.pivot.y + 2000 * Math.sin(view.elevation),
      view.pivot.z + 2000 * cosE * Math.cos(view.azimuth),
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(view.pivot);
    camera.zoom = view.zoom;
    camera.updateProjectionMatrix();
  }

  // ---------- State ----------
  let hovered: SubRuntime | null = null;
  let pulseAt: { route: RouteKey; reverse: boolean; progress: number } | null =
    null;

  function applyState(next: SceneState, first = false) {
    const now = performance.now() / 1000;
    const instant = reducedMotion || first;
    const explodeOrder = [...parts].sort((a, b) =>
      next.exploded ? a.data.lift - b.data.lift : b.data.lift - a.data.lift,
    );
    explodeOrder.forEach((part, index) => {
      const target = next.exploded ? 1 : 0;
      const duration = instant
        ? 0
        : next.exploded
          ? 0.95
          : DURATION.slow + 0.15;
      const stagger = instant
        ? 0
        : index * (next.exploded ? STAGGER.tight * 1.4 : STAGGER.tight);
      retarget(part.explode, target, now, stagger, duration, easeLift);
      const focused = next.selected === part.data.id ? 1 : 0;
      retarget(
        part.focus,
        focused,
        now,
        0,
        instant ? 0 : DURATION.state * 1.6,
        easeEnter,
      );
      const on = next.selected === part.data.id;
      const hot = next.hot.has(part.data.id);
      part.on.target = on ? 1 : 0;
      part.hot.target = hot ? 1 : 0;
      part.dim.target = next.selected !== null && !on && !hot ? 1 : 0;
      for (const sub of part.subs) {
        if (sub.data.platform === undefined) continue;
        const live = sub.data.platform === next.platform;
        sub.live.target = live ? 1 : 0;
        retarget(
          sub.seat,
          live ? 0 : 22,
          now,
          0,
          instant ? 0 : DURATION.slow,
          easeLift,
        );
      }
    });
    for (const route of routes) {
      const lit = next.lit.has(route.key);
      if (lit && route.lit.target === 0) {
        // Newly lit: the pulse draws it on, unless nothing travels.
        route.drawing = !reducedMotion;
        route.material.uniforms.uDraw.value = reducedMotion ? 1e6 : 0;
        route.material.polygonOffsetUnits = -2;
        route.material.polygonOffsetFactor = -1;
        route.lit.value = 1;
      }
      if (!lit && route.lit.target === 1) {
        route.drawing = false;
        route.material.polygonOffsetUnits = 1;
        route.material.polygonOffsetFactor = 1;
      }
      route.lit.target = lit ? 1 : 0;
    }
    // Frame the story: pulled back a touch while apart, and turned to show
    // the part being read at its best (unless the visitor has turned it).
    view.zoomTarget = next.exploded ? EXPLODED_ZOOM : 1;
    const angle =
      next.exploded && next.selected
        ? (STORY_VIEWS[next.selected] ?? [0, 0])
        : [0, 0];
    view.storyAzimuth = ISO_AZIMUTH + (angle[0] * Math.PI) / 180;
    view.storyElevation = ISO_ELEVATION + (angle[1] * Math.PI) / 180;
    if (!view.manual) {
      view.azimuthTarget = view.storyAzimuth;
      view.elevationTarget = view.storyElevation;
    }
    if (instant) {
      view.zoom = view.zoomTarget;
      view.azimuth = view.azimuthTarget;
      view.elevation = view.elevationTarget;
    }
    state = next;
  }

  // ---------- Overlay ----------
  const v = new Vector3();
  const toScreen = (point: Vector3): [number, number] => {
    v.copy(point).project(camera);
    return [((v.x + 1) / 2) * width, ((1 - v.y) / 2) * height];
  };
  const place = (element: HTMLElement, x: number, y: number) => {
    element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  };

  function subOffsetNow(sub: SubRuntime, now: number, seated = true): Vec3 {
    const part = sub.part;
    const [dx, dy, dz] = subOffset(
      part.data,
      sub.data,
      tweenValue(part.explode, now),
      tweenValue(part.focus, now),
    );
    return [dx, dy, dz + (seated ? tweenValue(sub.seat, now) : 0)];
  }

  function screenBox(sub: SubRuntime, offset: Vec3) {
    const { min, max } = sub.bounds;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const x of [min[0], max[0]]) {
      for (const y of [min[1], max[1]]) {
        for (const z of [min[2], max[2]]) {
          const [sx, sy] = toScreen(
            world(x + offset[0], y + offset[1], z + offset[2]),
          );
          x0 = Math.min(x0, sx);
          x1 = Math.max(x1, sx);
          y0 = Math.min(y0, sy);
          y1 = Math.max(y1, sy);
        }
      }
    }
    return { x0, y0, x1, y1 };
  }

  /** While a part is out for reading, other badges in front of it step aside. */
  function readingBoxes(now: number) {
    const reading = state.selected ? partById[state.selected] : null;
    const apart = reading && !reading.data.base;
    if (!apart || tweenValue(reading.explode, now) < 0.6) {
      return { reading, boxes: [] };
    }
    return {
      reading,
      boxes: reading.subs.map((sub) => screenBox(sub, subOffsetNow(sub, now))),
    };
  }

  function layoutBadge(
    part: PartRuntime,
    now: number,
    covers: (x: number, y: number) => boolean,
  ) {
    const on = state.selected === part.data.id;
    const dimmed = part.dim.target === 1;
    const offset = part.badgeSub
      ? subOffsetNow(part.badgeSub, now, false)
      : [0, 0, 0];
    const [bx, by, bz] = part.data.badgeAt;
    const foot = world(bx + offset[0], by + offset[1], bz + offset[2]);
    part.lead.position.copy(foot);
    const [sx, sy] = toScreen(foot.clone().add(new Vector3(0, LEAD, 0)));
    const size = Math.max(18, 30 * unitPx * view.zoom);
    part.badge.style.width = `${size}px`;
    part.badge.style.height = `${size}px`;
    part.badge.style.fontSize = `${Math.max(11, 17 * unitPx * view.zoom)}px`;
    place(part.badge, sx, sy);
    const covering = covers(sx, sy);
    const classes: [string, boolean][] = [
      ["bg-accent", on],
      ["border-accent", on],
      ["text-on-accent", on],
      ["bg-surface", !on],
      ["border-line-strong", !on],
      ["text-ink", !on && !dimmed],
      ["text-muted", !on && dimmed],
      ["opacity-60", dimmed && !covering],
      ["opacity-0", covering],
    ];
    for (const [name, value] of classes) {
      part.badge.classList.toggle(name, value);
    }
  }

  function layoutTags(part: PartRuntime, now: number) {
    const size = `${Math.max(10, 14 * unitPx * view.zoom)}px`;
    for (const sub of part.subs) {
      if (!sub.tag) continue;
      const o = subOffsetNow(sub, now);
      const { min, max } = sub.bounds;
      const [tx, ty] = toScreen(
        world(
          (min[0] + max[0]) / 2 + o[0],
          (min[1] + max[1]) / 2 + o[1],
          max[2] + o[2] + 2,
        ),
      );
      sub.tag.style.fontSize = size;
      sub.tag.style.opacity = String(
        sub.data.revealOnly ? tweenValue(part.explode, now) : 1,
      );
      place(sub.tag, tx, sub.data.platform === undefined ? ty : ty - 12);
    }
  }

  interface LabelEntry {
    sub: SubRuntime;
    box: ReturnType<typeof screenBox>;
    ax: number;
    ay: number;
  }

  function setLeader(entry: LabelEntry, x2: number, y2: number) {
    entry.sub.leader.setAttribute("x1", entry.ax.toFixed(1));
    entry.sub.leader.setAttribute("y1", entry.ay.toFixed(1));
    entry.sub.leader.setAttribute("x2", x2.toFixed(1));
    entry.sub.leader.setAttribute("y2", y2.toFixed(1));
    entry.sub.dot.setAttribute("cx", entry.ax.toFixed(1));
    entry.sub.dot.setAttribute("cy", entry.ay.toFixed(1));
  }

  /**
   * The plate's pieces are wide and flat: each label sits just above its own
   * piece (standing in for its tag), left to right, each lifted clear of any
   * label it would overlap.
   */
  function layoutLabelsInPlace(entries: LabelEntry[]) {
    entries.sort((a, b) => a.ax - b.ax);
    const placed: { x0: number; x1: number; y: number }[] = [];
    const overlaps = (x0: number, x1: number, y: number) =>
      placed.find(
        (other) =>
          x0 < other.x1 + 8 && x1 > other.x0 - 8 && Math.abs(y - other.y) < 22,
      );
    for (const entry of entries) {
      const half = entry.sub.label.offsetWidth / 2;
      const x = clamp(entry.ax, 8 + half, width - 8 - half);
      let y = entry.ay - 26;
      let other = overlaps(x - half, x + half, y);
      while (other) {
        y = other.y - 24;
        other = overlaps(x - half, x + half, y);
      }
      placed.push({ x0: x - half, x1: x + half, y });
      entry.sub.label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      setLeader(entry, x, y - 2);
      if (entry.sub.tag) entry.sub.tag.style.opacity = "0";
    }
  }

  /** Labels in a column on whichever side they fit, inside the stage. */
  function layoutLabelColumn(entries: LabelEntry[]) {
    const right = Math.max(...entries.map((entry) => entry.box.x1));
    const left = Math.min(...entries.map((entry) => entry.box.x0));
    const widest = Math.max(
      ...entries.map((entry) => entry.sub.label.offsetWidth),
    );
    const onRight = right + 28 + widest < width - 8 || left - 28 - widest < 8;
    const column = onRight
      ? Math.min(right + 28, width - 8 - widest)
      : Math.max(left - 28, 8 + widest);
    entries.sort((a, b) => a.ay - b.ay);
    let lastY = -Infinity;
    for (const entry of entries) {
      const y = Math.max(entry.ay, lastY + 24);
      lastY = y;
      entry.sub.label.style.transform = `translate(${column.toFixed(1)}px, ${y.toFixed(1)}px) translate(${onRight ? "0" : "-100%"}, -50%)`;
      setLeader(entry, column + (onRight ? -6 : 6), y);
    }
  }

  /** Labels: every piece of the part being read, plus the one under the pointer. */
  function layoutLabels(now: number) {
    const shown = new Set<SubRuntime>();
    const focused = state.selected ? partById[state.selected] : null;
    if (focused && tweenValue(focused.explode, now) > 0.6) {
      focused.subs.forEach((sub) => shown.add(sub));
    }
    if (hovered && tweenValue(hovered.part.explode, now) > 0.6) {
      shown.add(hovered);
    }
    const groups = new Map<PartRuntime, SubRuntime[]>();
    for (const sub of shown) {
      groups.set(sub.part, [...(groups.get(sub.part) ?? []), sub]);
    }
    for (const part of parts) {
      for (const sub of part.subs) {
        const visible = shown.has(sub);
        sub.label.classList.toggle("opacity-0", !visible);
        sub.leader.classList.toggle("opacity-0", !visible);
        sub.dot.classList.toggle("opacity-0", !visible);
      }
    }
    for (const [part, subs] of groups) {
      const entries = subs.map((sub): LabelEntry => {
        const offset = subOffsetNow(sub, now);
        const { min, max } = sub.bounds;
        const [ax, ay] = toScreen(
          world(
            (min[0] + max[0]) / 2 + offset[0],
            (min[1] + max[1]) / 2 + offset[1],
            (min[2] + max[2]) / 2 + offset[2],
          ),
        );
        return { sub, box: screenBox(sub, offset), ax, ay };
      });
      if (part.data.base) layoutLabelsInPlace(entries);
      else layoutLabelColumn(entries);
    }
  }

  function layoutOverlay(now: number) {
    const { reading, boxes } = readingBoxes(now);
    for (const part of parts) {
      const covers = (x: number, y: number) =>
        part !== reading &&
        boxes.some(
          (box) =>
            x > box.x0 - 8 &&
            x < box.x1 + 8 &&
            y > box.y0 - 8 &&
            y < box.y1 + 8,
        );
      layoutBadge(part, now, covers);
      layoutTags(part, now);
    }
    layoutLabels(now);
  }

  // ---------- Frame ----------
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let ready = false;
  let disposed = false;
  let dragging = false;

  function updateColours(part: PartRuntime) {
    const p = palette;
    const on = part.on.value;
    const hot = part.hot.value;
    const dim = part.dim.value * 0.42;
    const hover = part.hover.value * 0.1;
    const base = part.data.base;
    for (const sub of part.subs) {
      const live = sub.live.value;
      let top = mix(base ? p.baseTop : p.top, base ? p.baseOn : p.accent, on);
      let left = mix(base ? p.baseLeft : p.left, p.onLeft, on);
      let right = mix(base ? p.baseRight : p.right, p.accentStrong, on);
      let edge = mix(p.lineStrong, p.accent, on);
      top = mix(top, p.signal, hot);
      edge = mix(edge, p.signal, hot);
      top = mix(top, p.ink, live);
      edge = mix(edge, p.ink, live);
      const finish = (rgb: RGB) => mix(mix(rgb, p.ink, hover), p.tone, dim);
      top = finish(top);
      left = finish(left);
      right = finish(right);
      const inset = finish(p.surface);
      const u = sub.faces.uniforms;
      setRGB(u.uTop.value as Vector3, top);
      setRGB(u.uLeft.value as Vector3, left);
      setRGB(u.uRight.value as Vector3, right);
      const ui = sub.insets.uniforms;
      setRGB(ui.uTop.value as Vector3, inset);
      setRGB(ui.uLeft.value as Vector3, mix(inset, left, 0.25));
      setRGB(ui.uRight.value as Vector3, mix(inset, right, 0.25));
      setLineColour(sub.edges, finish(edge));
    }
    const leadMaterial = part.lead.material as LineDashedMaterial;
    leadMaterial.color.setRGB(
      ...mix(p.lineStrong, p.tone, dim),
      SRGBColorSpace,
    );
  }

  /** The assembly axis: up from where it seats, then out to where it is. */
  function placeAxis(sub: SubRuntime, offset: Vec3, explode: number) {
    const show = !sub.part.data.base && explode > 0.02;
    sub.axis.visible = show;
    if (!show) return;
    const [dx, dy, dz] = offset;
    const { min, max } = sub.bounds;
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;
    const cz = (min[2] + max[2]) / 2 + dz;
    const position = sub.axis.geometry.getAttribute("position");
    position.setXYZ(0, cx, 0, cy);
    position.setXYZ(1, cx, cz, cy);
    position.setXYZ(2, cx + dx, cz, cy + dy);
    position.needsUpdate = true;
    sub.axis.computeLineDistances();
    (sub.axis.material as LineDashedMaterial).opacity = explode * 0.85;
  }

  /** Moves and colours one part; true while it is still animating. */
  function stepPart(part: PartRuntime, now: number, colourK: number) {
    const explode = tweenValue(part.explode, now);
    let active = !tweenDone(part.explode, now) || !tweenDone(part.focus, now);
    for (const s of [part.on, part.hot, part.dim, part.hover]) {
      if (stepSmooth(s, colourK)) active = true;
    }
    for (const sub of part.subs) {
      if (stepSmooth(sub.live, colourK) || !tweenDone(sub.seat, now)) {
        active = true;
      }
      const offset = subOffsetNow(sub, now);
      sub.group.position.set(offset[0], offset[2], offset[1]);
      if (sub.data.revealOnly) {
        sub.group.visible = explode > 0.01;
        sub.group.scale.y = Math.max(0.001, explode);
      }
      placeAxis(sub, offset, explode);
    }
    for (const seat of part.seats) {
      seat.visible = explode > 0.02;
      (seat.material as LineDashedMaterial).opacity = explode * 0.7;
    }
    updateColours(part);
    return active;
  }

  /** Pipes retract into the board as it comes apart; lit ones fade. */
  function stepPipes(now: number, colourK: number) {
    const apart = Math.max(
      ...parts.map((part) => tweenValue(part.explode, now)),
    );
    pipes.scale.y = Math.max(0.001, 1 - apart);
    pipes.visible = apart < 0.99;
    let active = false;
    for (const route of routes) {
      if (stepSmooth(route.lit, colourK)) active = true;
      route.material.uniforms.uLit.value = route.lit.value;
    }
    if (pulseAt) {
      const route = routeByKey[pulseAt.route];
      const points = pulseAt.reverse
        ? [...route.points].reverse()
        : route.points;
      const [px, py] = pointAlong(
        points,
        pulseAt.progress * polylineLength(points),
      );
      pulseGroup.position.copy(world(px, py, 6));
      pulseGroup.quaternion.copy(camera.quaternion);
    }
    pulseGroup.visible = pulseAt !== null;
    return active;
  }

  /** Camera: drag and the story set targets; it eases towards them. */
  function stepCamera(dt: number) {
    const k = reducedMotion ? 1 : smoothing(dragging ? 18 : 5, dt);
    const before = [view.azimuth, view.elevation, view.zoom];
    view.azimuth += (view.azimuthTarget - view.azimuth) * k;
    view.elevation += (view.elevationTarget - view.elevation) * k;
    view.zoom += (view.zoomTarget - view.zoom) * k;
    const after = [view.azimuth, view.elevation, view.zoom];
    const moving = after.some((value, i) => Math.abs(value - before[i]) > 1e-4);
    if (!moving) {
      view.azimuth = view.azimuthTarget;
      view.elevation = view.elevationTarget;
      view.zoom = view.zoomTarget;
    }
    if (view.manual !== view.rotated) {
      view.rotated = view.manual;
      options.onRotated(view.rotated);
    }
    placeCamera();
    return moving;
  }

  function frame(time: number) {
    raf = 0;
    if (disposed) return;
    const now = time / 1000;
    const dt = last ? Math.min(0.05, now - last) : 1 / 60;
    last = now;
    const colourK = reducedMotion ? 1 : smoothing(1 / (DURATION.state / 3), dt);
    let active = false;
    for (const part of parts) {
      if (stepPart(part, now, colourK)) active = true;
    }
    if (stepPipes(now, colourK)) active = true;
    if (stepCamera(dt)) active = true;
    layoutOverlay(now);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      options.onReady();
    }
    if (active || dragging || pulseAt) kick();
    else last = 0;
  }

  function kick() {
    if (!raf && onScreen && !disposed) raf = requestAnimationFrame(frame);
  }

  // ---------- Pointer: drag to turn, click to pick ----------
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  let down: {
    x: number;
    y: number;
    azimuth: number;
    elevation: number;
    id: number;
  } | null = null;
  let velocity = { azimuth: 0, elevation: 0, at: 0, x: 0, y: 0 };
  let returnTimer = 0;

  function pick(event: PointerEvent): SubRuntime | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster
      .intersectObjects(pickables, false)
      .find(({ object }) => object.parent?.visible);
    return hit ? (hit.object.userData.sub as SubRuntime) : null;
  }

  function setHovered(sub: SubRuntime | null) {
    if (sub === hovered) return;
    hovered = sub;
    for (const part of parts) part.hover.target = sub?.part === part ? 1 : 0;
    canvas.style.cursor = dragging ? "grabbing" : sub ? "pointer" : "";
    kick();
  }

  const scheduleReturn = () => {
    window.clearTimeout(returnTimer);
    returnTimer = window.setTimeout(() => resetView(), 2600);
  };

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) return;
    window.clearTimeout(returnTimer);
    down = {
      x: event.clientX,
      y: event.clientY,
      azimuth: view.azimuthTarget,
      elevation: view.elevationTarget,
      id: event.pointerId,
    };
    velocity = {
      azimuth: 0,
      elevation: 0,
      at: performance.now(),
      x: event.clientX,
      y: event.clientY,
    };
  }

  function onPointerMove(event: PointerEvent) {
    if (!down) {
      if (event.pointerType === "mouse") setHovered(pick(event));
      return;
    }
    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    if (!dragging && Math.hypot(dx, dy) > 6) {
      dragging = true;
      view.manual = true;
      canvas.setPointerCapture(down.id);
      setHovered(null);
      canvas.style.cursor = "grabbing";
    }
    if (!dragging) return;
    view.azimuthTarget = clamp(down.azimuth - dx * 0.006, ...AZIMUTH_RANGE);
    view.elevationTarget = clamp(
      down.elevation + dy * 0.005,
      ...ELEVATION_RANGE,
    );
    const t = performance.now();
    const elapsed = Math.max(1, t - velocity.at) / 1000;
    velocity = {
      azimuth: (-(event.clientX - velocity.x) * 0.006) / elapsed,
      elevation: ((event.clientY - velocity.y) * 0.005) / elapsed,
      at: t,
      x: event.clientX,
      y: event.clientY,
    };
    kick();
  }

  function onPointerUp(event: PointerEvent) {
    if (!down) return;
    if (dragging) {
      dragging = false;
      if (canvas.hasPointerCapture(down.id)) {
        canvas.releasePointerCapture(down.id);
      }
      canvas.style.cursor = "";
      // A flick carries on a little (damped), unless motion is reduced.
      if (!reducedMotion && performance.now() - velocity.at < 80) {
        view.azimuthTarget = clamp(
          view.azimuthTarget + velocity.azimuth * 0.18,
          ...AZIMUTH_RANGE,
        );
        view.elevationTarget = clamp(
          view.elevationTarget + velocity.elevation * 0.18,
          ...ELEVATION_RANGE,
        );
      }
      kick();
    } else {
      const sub = pick(event);
      if (sub) {
        if (sub.data.platform !== undefined) options.onSlot(sub.data.platform);
        options.onPart(sub.part.data.id);
      }
    }
    down = null;
  }

  function onPointerLeave() {
    setHovered(null);
    if (view.rotated && !down) scheduleReturn();
  }
  function onPointerEnter() {
    window.clearTimeout(returnTimer);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerenter", onPointerEnter);

  function resetView() {
    window.clearTimeout(returnTimer);
    view.manual = false;
    view.azimuthTarget = view.storyAzimuth;
    view.elevationTarget = view.storyElevation;
    kick();
  }

  const onLost = (event: Event) => {
    event.preventDefault();
    options.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const resize = new ResizeObserver(() => {
    fit();
    kick();
  });
  resize.observe(host);
  resize.observe(svg);
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) kick();
  });
  visibility.observe(canvas);

  fit();
  applyState(state, true);
  kick();

  return {
    update(next) {
      applyState(next);
      kick();
    },
    pulse(route, reverse = false, progress = 0) {
      if (route) {
        const runtime = routeByKey[route];
        if (runtime.drawing) {
          if (reverse) runtime.drawing = false;
          runtime.material.uniforms.uDraw.value = reverse
            ? 1e6
            : progress * runtime.length;
          if (progress >= 1) {
            runtime.drawing = false;
            runtime.material.uniforms.uDraw.value = 1e6;
          }
        }
        pulseAt = { route, reverse, progress };
      } else {
        pulseAt = null;
      }
      kick();
    },
    resetView,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(returnTimer);
      resize.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      scene.traverse((object: Object3D) => {
        if (object instanceof Mesh || object instanceof Line) {
          // Shared geometry and materials are tracked; this catches the rest.
          (object.geometry as BufferGeometry).dispose();
        }
      });
      for (const thing of disposables) thing.dispose();
      renderer.dispose();
      canvas.remove();
      overlay.remove();
    },
  };
}
