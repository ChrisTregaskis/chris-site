import React from "react";
import { ActiveContentType } from "@/context";
import {
  ActiveContentProviderProps,
  ActiveContentContext,
} from "@/context/ActiveContentContext";

export const ActiveContentProvider: React.FC<ActiveContentProviderProps> = ({
  children,
}) => {
  const [activeContent, setActiveContent] =
    React.useState<ActiveContentType>("terminal");

  return (
    <ActiveContentContext.Provider
      value={{
        activeContent,
        setActiveContent,
      }}
    >
      {children}
    </ActiveContentContext.Provider>
  );
};
