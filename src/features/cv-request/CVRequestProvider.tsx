import { type ReactNode, useCallback, useMemo, useState } from "react";
import { CVRequestContext } from "./CVRequestContext";
import { type ApiStatus } from "@/lib/api";

interface CVRequestProviderProps {
  children: ReactNode;
}

export function CVRequestProvider({ children }: CVRequestProviderProps) {
  const [status, setStatus] = useState<ApiStatus>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({ status, setStatus, drawerOpen, openDrawer, closeDrawer }),
    [status, drawerOpen, openDrawer, closeDrawer],
  );

  return (
    <CVRequestContext.Provider value={value}>
      {children}
    </CVRequestContext.Provider>
  );
}
