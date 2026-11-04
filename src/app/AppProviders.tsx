import { type ReactNode } from "react";
import { CVRequestProvider } from "@/features/cv-request";
import { EnquiryProvider } from "@/features/enquiry";
import { type ScrollFeel, ScrollFeelProvider } from "@/features/scroll-feel";

interface AppProvidersProps {
  children: ReactNode;
  /** The scroll-feel prototype asked for (`?scroll=`), or null for the live site. */
  scrollFeel?: ScrollFeel | null;
}

/** Composes every app-wide provider: the CV request, the enquiry and the scroll-feel prototype. */
export function AppProviders({
  children,
  scrollFeel = null,
}: AppProvidersProps) {
  return (
    <ScrollFeelProvider feel={scrollFeel}>
      <CVRequestProvider>
        <EnquiryProvider>{children}</EnquiryProvider>
      </CVRequestProvider>
    </ScrollFeelProvider>
  );
}
