import { type ReactNode } from "react";
import { EnquiryContext } from "./EnquiryContext";
import { useDrawerFormState } from "@/hooks/useDrawerFormState";

interface EnquiryProviderProps {
  children: ReactNode;
}

export function EnquiryProvider({ children }: EnquiryProviderProps) {
  const value = useDrawerFormState();

  return (
    <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
  );
}
