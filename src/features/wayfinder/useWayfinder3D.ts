import { type RefObject, useEffect, useRef, useState } from "react";
import { type RouteKey } from "./iso";
import { type PartId, type PlatformIndex } from "./parts";
import { type SceneState, type WayfinderScene } from "./three/scene";

/**
 * PROTOTYPE. Where the 3D figure is offered: side by side (the wide layout)
 * with a mouse or trackpad. Phones and touch keep the SVG figure.
 */
const QUERY = "(min-width: 861px) and (hover: hover) and (pointer: fine)";

export type Figure3DStatus = "off" | "loading" | "ready";

export interface Wayfinder3DOptions {
  /** The pinned stage; three.js loads as it nears the viewport. */
  stageRef: RefObject<HTMLElement>;
  /** Positioned element the canvas fills. */
  hostRef: RefObject<HTMLElement>;
  /** Wraps the SVG figure, which the 3D board lines up with. */
  figureRef: RefObject<HTMLElement>;
  state: SceneState;
  reducedMotion: boolean;
  onPart: (id: PartId) => void;
  onSlot: (platform: PlatformIndex) => void;
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

/** `?figure=svg` keeps the SVG figure, for comparing the two. */
const forcedSvg = () =>
  new URLSearchParams(window.location.search).get("figure") === "svg";

/**
 * PROTOTYPE: lazily swaps the Wayfinder figure for a three.js model of it.
 * The SVG stays as the first paint and the fallback; three.js (one dynamic
 * chunk) is only fetched when the stage comes within half a screen of the
 * viewport, on a wide screen with a fine pointer and WebGL.
 */
export function useWayfinder3D({
  stageRef,
  hostRef,
  figureRef,
  state,
  reducedMotion,
  onPart,
  onSlot,
}: Wayfinder3DOptions) {
  const [status, setStatus] = useState<Figure3DStatus>("off");
  const [rotated, setRotated] = useState(false);
  const sceneRef = useRef<WayfinderScene | null>(null);
  const latest = useRef({ state, onPart, onSlot });
  latest.current = { state, onPart, onSlot };

  useEffect(() => {
    const stage = stageRef.current;
    const host = hostRef.current;
    if (!stage || !host) return undefined;
    if (!window.matchMedia(QUERY).matches || forcedSvg() || !webglAvailable()) {
      return undefined;
    }
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setStatus("loading");
        import("./three/scene")
          .then(({ createWayfinderScene }) => {
            const svg = figureRef.current?.querySelector("svg");
            if (cancelled || !svg) return;
            sceneRef.current = createWayfinderScene({
              host,
              svg,
              reducedMotion,
              initial: latest.current.state,
              onPart: (id) => latest.current.onPart(id),
              onSlot: (platform) => latest.current.onSlot(platform),
              onReady: () => setStatus("ready"),
              onRotated: setRotated,
              onLost: () => {
                sceneRef.current?.dispose();
                sceneRef.current = null;
                setStatus("off");
              },
            });
          })
          .catch(() => setStatus("off"));
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(stage);
    return () => {
      cancelled = true;
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [stageRef, hostRef, figureRef, reducedMotion]);

  const { selected, exploded, hot, lit, platform } = state;
  useEffect(() => {
    sceneRef.current?.update({ selected, exploded, hot, lit, platform });
  }, [selected, exploded, hot, lit, platform, status]);

  return {
    status,
    rotated,
    resetView: () => sceneRef.current?.resetView(),
    pulse: (route: RouteKey | null, reverse?: boolean, progress?: number) =>
      sceneRef.current?.pulse(route, reverse, progress),
  };
}
