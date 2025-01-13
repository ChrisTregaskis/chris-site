import React from "react";
import { ThemeProvider } from "./ThemeProvider";

// This is the main provider of the app wrapping it with the providers it needs
export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </>
  );
};
