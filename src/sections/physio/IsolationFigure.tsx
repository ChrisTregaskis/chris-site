import { lazy, Suspense } from "react";
import { type Drawing, drawingPlan } from "./explore/drawingPlan";
import { type DepthFit } from "./explore/fitDepth";
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
const FlatStack = lazy(() =>
  import("./flat/FlatStack").then((m) => ({ default: m.FlatStack })),
);
/* Exploration: the phone drafts, each its own lazy chunk too. */
const PHONE_STACKS = {
  a: lazy(() =>
    import("./explore/tray/TrayStack").then((m) => ({ default: m.TrayStack })),
  ),
  b: lazy(() =>
    import("./explore/drawer/DrawerStack").then((m) => ({
      default: m.DrawerStack,
    })),
  ),
  c: lazy(() =>
    import("./explore/floor/FloorStack").then((m) => ({
      default: m.FloorStack,
    })),
  ),
} as const;

interface IsolationFigureProps {
  test: LeakTest;
  /** `depth`: the 3D stack, where there's room for it; `flat`: phones and narrow screens; or a phone draft (exploration). */
  drawing: Drawing;
  /** Exploration: the 3D stack shrunk to fit, its query a size down. */
  fit?: DepthFit | null;
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
  drawing,
  controlsInside,
  drawn,
  still,
  fit = null,
}: IsolationFigureProps) {
  const { view, attempt, pressing } = test;
  const plan = drawingPlan(drawing, fit);
  const room = (
    <div
      aria-hidden="true"
      className={plan.room.className}
      style={{ height: plan.room.height }}
    />
  );
  let stack = <FlatStack view={view} attempt={attempt} still={still} />;
  if (plan.draft) {
    const PhoneStack = PHONE_STACKS[plan.draft];
    stack = <PhoneStack view={view} attempt={attempt} still={still} />;
  } else if (drawing === "depth") {
    stack = (
      <DepthStack
        view={view}
        attempt={attempt}
        still={still}
        fit={plan.shrunk}
      />
    );
  }
  return (
    <figure
      className={cn("m-0 w-full", plan.figure.className)}
      style={plan.figure.style}
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
        size={plan.query}
        still={still}
        steady={plan.steady}
      />
      <p className="sr-only" aria-live="polite">
        {test.spoken}
      </p>
      {drawn ? <Suspense fallback={room}>{stack}</Suspense> : room}
      {controlsInside ? (
        <LeakTestControls
          live={view.testing}
          target={view.target}
          asking={view.asking}
          onTry={test.tryOther}
          onReset={test.reset}
          pressing={pressing}
          demo={test.demo}
          paused={test.paused}
          onPause={test.pause}
          onPlay={test.play}
          focusProps={test.focusProps}
          className={drawing === "depth" ? "mt-3" : "mt-4"}
        />
      ) : null}
    </figure>
  );
}
