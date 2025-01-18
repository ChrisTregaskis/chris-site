import { 
  createContext,
  ReactNode
} from "react";
import { ActiveContentType } from ".";

export interface ActiveContentContextProps {
  activeContent: ActiveContentType;
  setActiveContent: React.Dispatch<React.SetStateAction<ActiveContentType>>;
}

export const ActiveContentContext = createContext<ActiveContentContextProps | undefined>(undefined);

export interface ActiveContentProviderProps {
  children: ReactNode;
}
