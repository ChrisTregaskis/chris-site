import { ThemeContext, ThemeMode, ThemeProviderProps } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [ themeMode, setThemeMode ] = useState<ThemeMode>(ThemeMode.DARK);

  useEffect(() => {
    document.documentElement.className = themeMode;
  }, [ themeMode ]);

  return (
    <ThemeContext.Provider 
      value={{ 
        themeMode,
        setThemeMode
      }}>
      {children}
    </ThemeContext.Provider>
  );
};