import React from "react";
import { ActiveContentProvider } from "./ActiveContentProvider";
import { ThemeProvider } from "@/features/theme";
import { CVRequestProvider } from "@/features/cv-request";

// This is the main provider of the app wrapping it with the providers it needs
export const AppProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <ThemeProvider>
        <ActiveContentProvider>
          <CVRequestProvider>{children}</CVRequestProvider>
        </ActiveContentProvider>
      </ThemeProvider>
    </>
  );
};
