import { createContext, ReactNode } from "react";

export interface ThemeContextProps {
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
);

export interface ThemeProviderProps {
  children: ReactNode;
}

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
}
