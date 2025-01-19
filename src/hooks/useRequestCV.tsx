import React from "react";
import { RequestCVContext, RequestCVContextProps } from "@/context/RequestCVContext";

export const useRequestCV = (): RequestCVContextProps => {
  const context = React.useContext(RequestCVContext);

  if (!context) {
    throw new Error("useRequestCV must be used within a RequestCVProvider");
  }

  return context;
};