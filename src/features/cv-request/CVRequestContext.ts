import { createContext, useContext } from "react";
import { type ApiStatus } from "@/lib/api";

export interface CVRequestContextValue {
  status: ApiStatus;
  setStatus: React.Dispatch<React.SetStateAction<ApiStatus>>;
}

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
