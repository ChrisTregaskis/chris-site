import { type ReactNode } from "react";
import { CVRequestProvider } from "@/features/cv-request";
import { EnquiryProvider } from "@/features/enquiry";

interface AppProvidersProps {
  children: ReactNode;
}

/** Composes every app-wide provider: the CV request and the enquiry. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <CVRequestProvider>
      <EnquiryProvider>{children}</EnquiryProvider>
    </CVRequestProvider>
  );
}
