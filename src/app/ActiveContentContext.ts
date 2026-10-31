import { createContext, useContext } from "react";

/** Which panel the single-page shell shows. Retired in 3c by the long-scroll sections. */
export type ActiveContent = "terminal" | "about" | "resume";

export interface ActiveContentContextValue {
  activeContent: ActiveContent;
  setActiveContent: React.Dispatch<React.SetStateAction<ActiveContent>>;
}

export const ActiveContentContext = createContext<
  ActiveContentContextValue | undefined
>(undefined);

export function useActiveContent(): ActiveContentContextValue {
  const context = useContext(ActiveContentContext);

  if (!context) {
    throw new Error(
      "useActiveContent must be used within a ActiveContentProvider",
    );
  }

  return context;
}
