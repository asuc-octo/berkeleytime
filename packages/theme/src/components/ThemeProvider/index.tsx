import { ReactNode, useEffect, useState } from "react";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";

import { Theme, ThemeContext } from "@repo/theme";

import styles from "./ThemeProvider.module.scss";

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") as Theme
  );

  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);

      return;
    }

    localStorage.removeItem("theme");
    document.body.removeAttribute("data-theme");
  }, [theme]);

  return (
    <div className={styles.root}>
      <IconoirProvider
        iconProps={{
          strokeWidth: 1.5,
          width: 16,
          height: 16,
        }}
      >
        <TooltipProvider delayDuration={250}>
          <ThemeContext.Provider value={{ theme: theme, setTheme }}>
            {children}
          </ThemeContext.Provider>
        </TooltipProvider>
      </IconoirProvider>
    </div>
  );
}
