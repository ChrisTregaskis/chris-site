import { createContext, useContext } from "react";
import { type ApiStatus } from "@/lib/api";

export interface CVRequestContextValue {
  /** The CV request: idle, sending, unlocked, or failed to reach the server. */
  status: ApiStatus;
  setStatus: React.Dispatch<React.SetStateAction<ApiStatus>>;
  /** Whether the CV drawer is open. Any "Request my CV" button opens it. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
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
