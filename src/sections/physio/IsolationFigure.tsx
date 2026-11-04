import { DepthStack } from "./depth/DepthStack";
import { FlatStack } from "./flat/FlatStack";
import { LeakTestControls } from "./LeakTestControls";
import { QueryLines } from "./QueryLines";
import { SignedInPicker } from "./SignedInPicker";
import { type LeakTest } from "./useLeakTest";
import { cn } from "@/lib/cn";

interface IsolationFigureProps {
  test: LeakTest;
  /** `depth`: the 3D stack, where there's room for it; `flat`: phones and narrow screens. */
  drawing: "depth" | "flat";
  /** The picker and the leak test's buttons live in the figure (side by side), or with the last step (stacked). */
  controlsInside: boolean;
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
  still,
}: IsolationFigureProps) {
  const { view, attempt, pressing } = test;
  return (
    <figure
      className={cn(
        "m-0 w-full",
        drawing === "depth" ? "max-w-[560px]" : "max-w-[480px]",
      )}
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
        size={drawing === "depth" ? "large" : "compact"}
        still={still}
      />
      <p className="sr-only" aria-live="polite">
        {test.spoken}
      </p>
      {drawing === "depth" ? (
        <DepthStack view={view} attempt={attempt} still={still} />
      ) : (
        <FlatStack view={view} attempt={attempt} still={still} />
      )}
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
          className={drawing === "flat" ? "mt-4" : "mt-3"}
        />
      ) : null}
    </figure>
  );
}
