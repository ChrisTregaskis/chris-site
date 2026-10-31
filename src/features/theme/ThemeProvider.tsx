import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ThemeContext, ThemeMode } from "./ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.DARK);

  useEffect(() => {
    document.documentElement.className = themeMode;
  }, [themeMode]);

  const value = useMemo(() => ({ themeMode, setThemeMode }), [themeMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
