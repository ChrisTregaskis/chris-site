import { createContext, useContext } from "react";
import { type DrawerFormState } from "@/hooks/useDrawerFormState";

/** The enquiry's status and drawer state. Any "Get in touch" button opens it. */
export type EnquiryContextValue = DrawerFormState;

export const EnquiryContext = createContext<EnquiryContextValue | undefined>(
  undefined,
);

export function useEnquiry(): EnquiryContextValue {
  const context = useContext(EnquiryContext);

  if (!context) {
    throw new Error("useEnquiry must be used within an EnquiryProvider");
  }

  return context;
}
