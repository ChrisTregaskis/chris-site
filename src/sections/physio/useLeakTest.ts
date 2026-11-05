import {
  type FocusEvent,
  type RefObject,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  INITIAL_LOOP,
  type LoopMove,
  loopReducer,
  nextLoopEvent,
} from "./demo";
import { type LeakView, leakView } from "./leakTest";
import { type Org } from "./organisations";

export interface LeakTest {
  view: LeakView;
  /** What the live region says: the story's steps and the visitor's moves, never the loop's. */
  spoken: string;
  /** Counts each try, so every one replays the attempt; 0 when not asking. */
  attempt: number;
  /** The button the loop is pressing right now, if it's playing. */
  pressing: LoopMove | null;
  /** The example loop can be turned on here (the leak test is open). */
  loopable: boolean;
  /** It's on. */
  looping: boolean;
  pick: (org: Org) => void;
  tryOther: () => void;
  reset: () => void;
  /** Turns the example loop on or off. */
  toggleLoop: () => void;
  /** Spread on anything holding the leak test's buttons: arriving there with the keyboard stops the loop. */
  focusProps: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
  };
}

interface LeakTestOptions {
  /** The chapter: the loop stops once it's off screen. */
  watch: RefObject<HTMLElement>;
}

function focusVisible(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return false;
  }
}

/**
 * The story's state for a stage (1 to 3), the leak test's actions, and its
 * example loop (see `demo.ts`): off until the visitor turns it on in step
 * 3. It stops for good when they use a button themselves (or arrive on one
 * with the keyboard), when step 3 is no longer the current one, or when
 * the chapter goes off screen; it holds while the browser tab is hidden.
 * Under reduced motion it may still be turned on: its moves are instant.
 */
export function useLeakTest(
  stage: number,
  { watch }: LeakTestOptions,
): LeakTest {
  const [state, dispatch] = useReducer(loopReducer, INITIAL_LOOP);
  const view = leakView(stage, state.leak);

  const [onScreen, setOnScreen] = useState(false);
  const [tabShown, setTabShown] = useState(true);

  useEffect(() => {
    const element = watch.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) =>
      setOnScreen(entries.some((entry) => entry.isIntersecting)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [watch]);

  useEffect(() => {
    const update = () => setTabShown(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const loopable = view.testing;
  // Scrolled away (step 3 no longer current, or the chapter off screen): the loop stops, and stays off.
  const away = !loopable || !onScreen;
  useEffect(() => {
    if (state.looping && away) dispatch({ type: "stop" });
  }, [state.looping, away]);

  const playing = state.looping && !away && tabShown;

  useEffect(() => {
    if (!playing) return undefined;
    const { delay, action } = nextLoopEvent(state);
    const timer = window.setTimeout(() => dispatch(action), delay);
    return () => window.clearTimeout(timer);
  }, [playing, state]);

  // The live region holds what was last announced while the loop moves.
  const announce = !(view.testing && state.by === "loop");
  const [heard, setHeard] = useState(view.spoken);
  if (announce && heard !== view.spoken) setHeard(view.spoken);

  const actions = useMemo(
    () => ({
      pick: (org: Org) =>
        dispatch({ type: "visitor", action: { type: "pick", org } }),
      tryOther: () => dispatch({ type: "visitor", action: { type: "try" } }),
      reset: () => dispatch({ type: "visitor", action: { type: "reset" } }),
      focusProps: {
        onFocus: (event: FocusEvent<HTMLElement>) => {
          if (focusVisible(event.target)) dispatch({ type: "stop" });
        },
      },
    }),
    [],
  );
  const toggleLoop = () => dispatch({ type: state.looping ? "stop" : "start" });

  return {
    view,
    spoken: announce ? view.spoken : heard,
    attempt: view.asking ? state.leak.attempt : 0,
    pressing: playing ? state.pressing : null,
    loopable,
    looping: state.looping,
    ...actions,
    toggleLoop,
  };
}
