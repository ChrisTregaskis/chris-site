import { type ReactNode } from "react";
import { ActiveContentProvider } from "./ActiveContentProvider";
import { CVRequestProvider } from "@/features/cv-request";
import { ThemeProvider } from "@/features/theme";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composes every app-wide provider. Order matters: the theme sits outermost
 * because `useToast` (used by the CV form and the terminal) reads it.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ActiveContentProvider>
        <CVRequestProvider>{children}</CVRequestProvider>
      </ActiveContentProvider>
    </ThemeProvider>
  );
}
