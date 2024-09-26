import { ReactNode, useEffect, useState } from "react";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { IconoirProvider } from "iconoir-react";

import ThemeContext, { Theme } from "@/context/ThemeContext";

import styles from "./ThemeProvider.module.scss";

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
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
          strokeWidth: 2,
          width: 16,
          height: 16,
        }}
      >
        <TooltipProvider delayDuration={0}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
          </ThemeContext.Provider>
        </TooltipProvider>
      </IconoirProvider>
    </div>
  );
}
