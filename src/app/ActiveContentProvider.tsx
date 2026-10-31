import { type ReactNode, useMemo, useState } from "react";
import {
  type ActiveContent,
  ActiveContentContext,
} from "./ActiveContentContext";

interface ActiveContentProviderProps {
  children: ReactNode;
}

export function ActiveContentProvider({
  children,
}: ActiveContentProviderProps) {
  const [activeContent, setActiveContent] = useState<ActiveContent>("terminal");

  const value = useMemo(
    () => ({ activeContent, setActiveContent }),
    [activeContent],
  );

  return (
    <ActiveContentContext.Provider value={value}>
      {children}
    </ActiveContentContext.Provider>
  );
}
