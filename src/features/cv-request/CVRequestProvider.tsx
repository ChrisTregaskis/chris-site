import { type ReactNode } from "react";
import { CVRequestContext } from "./CVRequestContext";
import { useDrawerFormState } from "@/hooks/useDrawerFormState";

interface CVRequestProviderProps {
  children: ReactNode;
}

export function CVRequestProvider({ children }: CVRequestProviderProps) {
  const value = useDrawerFormState();

  return (
    <CVRequestContext.Provider value={value}>
      {children}
    </CVRequestContext.Provider>
  );
}
