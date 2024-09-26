import { Dispatch, SetStateAction, createContext } from "react";

export type Theme = "light" | "dark" | null;

export interface ThemeContextType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export default ThemeContext;
