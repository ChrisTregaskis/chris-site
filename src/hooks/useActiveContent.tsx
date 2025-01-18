import React from "react";
import { ActiveContentContext, ActiveContentContextProps } from "@/context/ActiveContentContext";

export const useActiveContent = (): ActiveContentContextProps => {
  const context = React.useContext(ActiveContentContext);

  if (!context) {
    throw new Error("useActiveContent must be used within a ActiveContentProvider");
  }

  return context;
};