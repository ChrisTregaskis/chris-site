import { type ReactNode } from "react";
import { CVRequestProvider } from "@/features/cv-request";
import { EnquiryProvider } from "@/features/enquiry";
import {
  type RailNumeral,
  type ScrollFeel,
  ScrollFeelProvider,
} from "@/features/scroll-feel";

interface AppProvidersProps {
  children: ReactNode;
  /** The scroll-feel prototype asked for (`?scroll=`), or null for the live site. */
  scrollFeel?: ScrollFeel | null;
  /** How the rails set their chapter's number (`&num=`); the recommended one without it. */
  railNumeral?: RailNumeral;
}

/** Composes every app-wide provider: the CV request, the enquiry and the scroll-feel prototype. */
export function AppProviders({
  children,
  scrollFeel = null,
  railNumeral,
}: AppProvidersProps) {
  return (
    <ScrollFeelProvider feel={scrollFeel} numeral={railNumeral}>
      <CVRequestProvider>
        <EnquiryProvider>{children}</EnquiryProvider>
      </CVRequestProvider>
    </ScrollFeelProvider>
  );
}
