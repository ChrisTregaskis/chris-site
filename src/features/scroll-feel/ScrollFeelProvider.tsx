import { type ReactNode, useMemo } from "react";
import {
  DEFAULT_RAIL_NUMERAL,
  type RailNumeral,
  type ScrollFeel,
} from "./scrollFeel";
import { ScrollFeelContext } from "./ScrollFeelContext";

interface ScrollFeelProviderProps {
  /** Read once from the address by the entry (`scrollFeelFrom`), never during render. */
  feel: ScrollFeel | null;
  /** The same, for the rails' numeral (`railNumeralFrom`). */
  numeral?: RailNumeral;
  children: ReactNode;
}

export function ScrollFeelProvider({
  feel,
  numeral = DEFAULT_RAIL_NUMERAL,
  children,
}: ScrollFeelProviderProps) {
  const value = useMemo(() => ({ feel, numeral }), [feel, numeral]);
  return (
    <ScrollFeelContext.Provider value={value}>
      {children}
    </ScrollFeelContext.Provider>
  );
}
