import React from "react";
import { ApiStatus } from "@/context";
import { RequestCVContext, RequestCVProviderProps } from "@/context/RequestCVContext";

export const RequestCVProvider: React.FC<RequestCVProviderProps> = ({ children }) => {
  const [ status, setStatus ] = React.useState<ApiStatus>("idle");

  return (
    <RequestCVContext.Provider 
      value={{ 
        status,
        setStatus
      }}>
      {children}
    </RequestCVContext.Provider>
  );
};