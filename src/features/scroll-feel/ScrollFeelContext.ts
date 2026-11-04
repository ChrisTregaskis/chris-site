import { createContext, useContext } from "react";
import { type ScrollFeel } from "./scrollFeel";

/**
 * Which scroll-feel prototype the page is showing, or null for the live
 * site. Unlike the app's other contexts it has a meaningful default (off),
 * so a component rendered outside the provider (a feature's own tests) is
 * simply the live site rather than an error.
 */
export const ScrollFeelContext = createContext<ScrollFeel | null>(null);

export function useScrollFeel(): ScrollFeel | null {
  return useContext(ScrollFeelContext);
}
