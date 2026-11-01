import { type ReactNode } from "react";
import { CVRequestContext } from "./CVRequestContext";
import { useDrawerFormState } from "@/hooks/useDrawerFormState";

/** Set once a CV request unlocks the CV, so a later visit opens on the unlocked view. */
const CV_UNLOCKED_KEY = "ct:cv-unlocked:v1";

interface CVRequestProviderProps {
  children: ReactNode;
}

export function CVRequestProvider({ children }: CVRequestProviderProps) {
  const value = useDrawerFormState(CV_UNLOCKED_KEY);

  return (
    <CVRequestContext.Provider value={value}>
      {children}
    </CVRequestContext.Provider>
  );
}
