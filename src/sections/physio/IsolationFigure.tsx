import { lazy, Suspense } from "react";
import { STACK_H } from "./depth/depthGeometry";
import { type DepthFit, STACK_GAP_CLASS } from "./depth/fitDepth";
import { SCENE_BOX_H, ZOOM_CLASSES } from "./glass/glassGeometry";
import { LeakTestControls } from "./LeakTestControls";
import { QueryLines } from "./QueryLines";
import { SignedInPicker } from "./SignedInPicker";
import { type LeakTest } from "./useLeakTest";
import { cn } from "@/lib/cn";

/*
 * The drawings load on their own, after the page's first paint, and draw
 * only as the visitor nears them; until then their room is kept, at their
 * exact height, so nothing moves when they arrive.
 */
const DepthStack = lazy(() =>
  import("./depth/DepthStack").then((m) => ({ default: m.DepthStack })),
);
const GlassStack = lazy(() =>
  import("./glass/GlassStack").then((m) => ({ default: m.GlassStack })),
);

interface IsolationFigureProps {
  test: LeakTest;
  /** Where the 3D stack fits, and its scale (`fitDepth`); elsewhere, or before it's measured, the glass floor. */
  fit: DepthFit | null;
  /** The picker and the leak test's buttons live in the figure (side by side), or with the last step (stacked). */
  controlsInside: boolean;
  /** Draw the stack (the visitor is near); until then its room is kept empty. */
  drawn: boolean;
  still: boolean;
}

/**
 * Chapter 2's figure: who's signed in, the query, what comes back, and the
 * sessions table drawn under it, so the picture and the query tell the same
 * story at every step.
 */
export function IsolationFigure({
  test,
  fit,
  controlsInside,
  drawn,
  still,
}: IsolationFigureProps) {
  const { view, attempt, pressing } = test;
  const depth = fit?.depth ? fit : null;
  const room = (
    <div
      aria-hidden="true"
      className={depth ? STACK_GAP_CLASS[depth.query] : "mt-3"}
      style={{ height: depth ? STACK_H * depth.scale : SCENE_BOX_H }}
    />
  );
  return (
    <figure
      className={cn(
        "m-0 w-full",
        depth ? "max-w-[560px]" : ["max-w-[480px]", ZOOM_CLASSES],
      )}
      // Stacked (tablets held upright), an inset keeps the policy plane's overhang on screen.
      style={
        depth?.inset
          ? {
              paddingLeft: depth.inset,
              maxWidth: 560 * depth.scale + depth.inset,
            }
          : undefined
      }
      aria-label="One sessions table holding every organisation's rows, drawn as one sheet per organisation under the query that reads it"
    >
      {controlsInside ? (
        <SignedInPicker
          shown={view.asked}
          live={view.testing}
          who={view.who}
          onPick={test.pick}
          pressing={pressing?.kind === "pick" ? pressing.org : null}
          focusProps={test.focusProps}
          className="mb-3"
        />
      ) : null}
      <QueryLines
        view={view}
        size={depth ? depth.query : "compact"}
        still={still}
      />
      <p className="sr-only" aria-live="polite">
        {test.spoken}
      </p>
      {drawn ? (
        <Suspense fallback={room}>
          {depth ? (
            <DepthStack
              view={view}
              attempt={attempt}
              still={still}
              fit={depth}
            />
          ) : (
            <GlassStack view={view} attempt={attempt} still={still} />
          )}
        </Suspense>
      ) : (
        room
      )}
      {controlsInside ? (
        <LeakTestControls
          live={view.testing}
          target={view.target}
          asking={view.asking}
          onTry={test.tryOther}
          onReset={test.reset}
          pressing={pressing}
          focusProps={test.focusProps}
          className={depth ? "mt-3" : "mt-4"}
        />
      ) : null}
    </figure>
  );
}
