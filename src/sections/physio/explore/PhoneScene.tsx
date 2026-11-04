import { type CSSProperties, type ReactNode } from "react";
import { MOVE } from "../stackMotion";
import { SCENE_BOX_H, SCENE_H } from "./sceneMeasures";
import { type PhoneDraft } from "./variant";
import { cn } from "@/lib/cn";

interface PhoneSceneProps {
  draft: PhoneDraft;
  /** The perspective's distance, px. */
  perspective: number;
  /** Where the eye is, down the scene, px (across: the middle). */
  eyeY: number;
  /** The whole scene's tilt, and the height it turns about. */
  view: string;
  axisY: number;
  children: ReactNode;
}

/**
 * Exploration: the box a phone drawing is drawn in. As wide as its column
 * and `SCENE_H` tall, zoomed as a whole on taller phones (`--pk`); inside,
 * real CSS 3D (perspective, preserve-3d). Decorative (the query and its
 * line say it all) and never in the way of a tap.
 */
export function PhoneScene({
  draft,
  perspective,
  eyeY,
  view,
  axisY,
  children,
}: PhoneSceneProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="sessions-stack"
      data-drawing={draft}
      className="pointer-events-none relative mt-3 w-full"
      style={{ height: SCENE_BOX_H }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={
          {
            width: "calc(100% / var(--pk, 1))",
            height: SCENE_H,
            transform: "scale(var(--pk, 1))",
            perspective: `${perspective}px`,
            perspectiveOrigin: `50% ${eyeY}px`,
          } as CSSProperties
        }
      >
        <div
          className={cn(MOVE, "absolute inset-0 [transform-style:preserve-3d]")}
          style={{
            transitionDuration: "var(--duration-apart)",
            transform: view,
            transformOrigin: `50% ${axisY}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
