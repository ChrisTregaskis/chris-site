import { type ReactNode } from "react";
import { type ScrollFeel } from "./scrollFeel";
import { ScrollFeelContext } from "./ScrollFeelContext";

interface ScrollFeelProviderProps {
  /** Read once from the address by the entry (`scrollFeelFrom`), never during render. */
  feel: ScrollFeel | null;
  children: ReactNode;
}

export function ScrollFeelProvider({
  feel,
  children,
}: ScrollFeelProviderProps) {
  return (
    <ScrollFeelContext.Provider value={feel}>
      {children}
    </ScrollFeelContext.Provider>
  );
}
