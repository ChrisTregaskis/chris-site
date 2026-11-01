import { createContext, useContext } from "react";
import { type DrawerFormState } from "@/hooks/useDrawerFormState";

/** The CV request's status and drawer state. Any "Request my CV" button opens it. */
export type CVRequestContextValue = DrawerFormState;

export const CVRequestContext = createContext<
  CVRequestContextValue | undefined
>(undefined);

export function useCVRequest(): CVRequestContextValue {
  const context = useContext(CVRequestContext);

  if (!context) {
    throw new Error("useCVRequest must be used within a CVRequestProvider");
  }

  return context;
}
