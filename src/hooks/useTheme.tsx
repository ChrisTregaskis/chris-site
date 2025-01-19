import React from "react";
import { ThemeContext, ThemeContextProps } from "@/context/ThemeContext";

export const useTheme = (): ThemeContextProps => {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};