import { type ReactNode } from "react";
import { EnquiryContext } from "./EnquiryContext";
import { useDrawerFormState } from "@/hooks/useDrawerFormState";

/** Set once an enquiry is sent, so a later visit opens on the sent view. */
const ENQUIRY_SENT_KEY = "ct:enquiry-sent:v1";

interface EnquiryProviderProps {
  children: ReactNode;
}

export function EnquiryProvider({ children }: EnquiryProviderProps) {
  const value = useDrawerFormState(ENQUIRY_SENT_KEY);

  return (
    <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
  );
}
