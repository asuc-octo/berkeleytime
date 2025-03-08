import { ReactNode, useEffect, useState } from "react";

import { IconoirProvider } from "iconoir-react";
import { Tooltip } from "radix-ui";

import { Theme, ThemeContext } from "@repo/theme";

import { StackContext } from "../../contexts/StackContext";
import "./ThemeProvider.scss";

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
    <StackContext value={1000}>
      <IconoirProvider
        iconProps={{
          strokeWidth: 2,
          width: 16,
          height: 16,
        }}
      >
        <Tooltip.Provider delayDuration={250}>
          <ThemeContext value={{ theme: theme, setTheme }}>
            {children}
          </ThemeContext>
        </Tooltip.Provider>
      </IconoirProvider>
    </StackContext>
  );
}
