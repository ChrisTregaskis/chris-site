import { ThemeContext, ThemeContextProps } from "@/context/ThemeContext";
import React from "react";

export const useTheme = (): ThemeContextProps => {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};