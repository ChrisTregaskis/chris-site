import { type ReactNode, useMemo, useState } from "react";
import { CVRequestContext } from "./CVRequestContext";
import { type ApiStatus } from "@/lib/api";

interface CVRequestProviderProps {
  children: ReactNode;
}

export function CVRequestProvider({ children }: CVRequestProviderProps) {
  const [status, setStatus] = useState<ApiStatus>("idle");

  const value = useMemo(() => ({ status, setStatus }), [status]);

  return (
    <CVRequestContext.Provider value={value}>
      {children}
    </CVRequestContext.Provider>
  );
}
