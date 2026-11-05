import { createContext, useContext } from "react";
import {
  DEFAULT_RAIL_NUMERAL,
  type RailNumeral,
  type ScrollFeel,
  showsChapterRails,
  showsDeadZoneCues,
} from "./scrollFeel";

export interface ScrollFeelValue {
  /** Which prototype the page is showing, or null for the live site. */
  feel: ScrollFeel | null;
  /** How the rails set their chapter's number (`&num=`). */
  numeral: RailNumeral;
}

/**
 * Which scroll-feel prototype the page is showing. Unlike the app's other
 * contexts it has a meaningful default (off), so a component rendered
 * outside the provider (a feature's own tests) is simply the live site
 * rather than an error.
 */
export const ScrollFeelContext = createContext<ScrollFeelValue>({
  feel: null,
  numeral: DEFAULT_RAIL_NUMERAL,
});

export function useScrollFeel(): ScrollFeel | null {
  return useContext(ScrollFeelContext).feel;
}

/** How the rails set their chapter's number (`&num=a`, `b` or `c`). */
export function useRailNumeral(): RailNumeral {
  return useContext(ScrollFeelContext).numeral;
}

/** Whether the chapters carry their progress rails (`?scroll=b` or `bc`). */
export function useChapterRails(): boolean {
  return showsChapterRails(useScrollFeel());
}

/** Whether the dead stretches carry their cues (`?scroll=c` or `bc`). */
export function useDeadZoneCues(): boolean {
  return showsDeadZoneCues(useScrollFeel());
}
