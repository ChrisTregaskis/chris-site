import { type ReactNode } from "react";
import { ActiveContentProvider } from "./ActiveContentProvider";
import { CVRequestProvider } from "@/features/cv-request";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composes every app-wide provider: ActiveContent, then CVRequest (the CV form
 * reads both).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ActiveContentProvider>
      <CVRequestProvider>{children}</CVRequestProvider>
    </ActiveContentProvider>
  );
}
