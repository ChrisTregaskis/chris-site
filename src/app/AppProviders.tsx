import { type ReactNode } from "react";
import { CVRequestProvider } from "@/features/cv-request";

interface AppProvidersProps {
  children: ReactNode;
}

/** Composes every app-wide provider. Today only the CV request is app-wide. */
export function AppProviders({ children }: AppProvidersProps) {
  return <CVRequestProvider>{children}</CVRequestProvider>;
}
