import {
  type FocusEvent,
  type RefObject,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  type DemoMove,
  demoReducer,
  INITIAL_DEMO,
  nextDemoEvent,
} from "./demo";
import { type LeakView, leakView } from "./leakTest";
import { type Org } from "./organisations";

export interface LeakTest {
  view: LeakView;
  /** What the live region says: the story's steps and the visitor's moves, never the demo's. */
  spoken: string;
  /** Counts each try, so every one replays the attempt; 0 when not asking. */
  attempt: number;
  /** The button the demo is pressing right now, if it's playing. */
  pressing: DemoMove | null;
  /** The demo can play here (the leak test is open and motion is allowed). */
  demo: boolean;
  /** The visitor paused it. */
  paused: boolean;
  pick: (org: Org) => void;
  tryOther: () => void;
  reset: () => void;
  pause: () => void;
  play: () => void;
  /** Spread on anything holding the leak test's controls: keyboard focus there holds the demo. */
  focusProps: {
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
}

interface LeakTestOptions {
  /** Reduced motion: no demo, the static step 3 state. */
  still: boolean;
  /** The demo only plays while this is on screen. */
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
 * demo: in step 3 the leak test plays itself (see `demo.ts`) while the
 * figure is on screen, the tab is showing, the visitor isn't on its
 * controls with the keyboard and hasn't paused it.
 */
export function useLeakTest(
  stage: number,
  { still, watch }: LeakTestOptions,
): LeakTest {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_DEMO);
  const view = leakView(stage, state.leak);

  const [onScreen, setOnScreen] = useState(false);
  const [tabShown, setTabShown] = useState(true);
  const [keyboard, setKeyboard] = useState(false);

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

  const demo = view.testing && !still;
  const playing = demo && onScreen && tabShown && !keyboard && !state.paused;

  useEffect(() => {
    if (!playing) return undefined;
    const { delay, action } = nextDemoEvent(state);
    const timer = window.setTimeout(() => dispatch(action), delay);
    return () => window.clearTimeout(timer);
  }, [playing, state]);

  // The live region holds what was last announced while the demo moves.
  const announce = !(view.testing && state.by === "demo");
  const [heard, setHeard] = useState(view.spoken);
  if (announce && heard !== view.spoken) setHeard(view.spoken);

  const actions = useMemo(
    () => ({
      pick: (org: Org) =>
        dispatch({ type: "visitor", action: { type: "pick", org } }),
      tryOther: () => dispatch({ type: "visitor", action: { type: "try" } }),
      reset: () => dispatch({ type: "visitor", action: { type: "reset" } }),
      pause: () => dispatch({ type: "pause" }),
      play: () => dispatch({ type: "play" }),
      focusProps: {
        onFocus: (event: FocusEvent<HTMLElement>) =>
          setKeyboard(focusVisible(event.target)),
        onBlur: (event: FocusEvent<HTMLElement>) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
            setKeyboard(false);
          }
        },
      },
    }),
    [],
  );

  return {
    view,
    spoken: announce ? view.spoken : heard,
    attempt: view.asking ? state.leak.attempt : 0,
    pressing: playing ? state.pressing : null,
    demo,
    paused: state.paused,
    ...actions,
  };
}
