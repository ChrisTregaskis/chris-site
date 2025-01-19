import { createContext, ReactNode } from "react";
import { ApiStatus } from ".";

export interface RequestCVContextProps {
  status: ApiStatus;
  setStatus: React.Dispatch<React.SetStateAction<ApiStatus>>;
}

export const RequestCVContext = createContext<
  RequestCVContextProps | undefined
>(undefined);

export interface RequestCVProviderProps {
  children: ReactNode;
}
