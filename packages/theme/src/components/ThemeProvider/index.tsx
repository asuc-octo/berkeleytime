import { ReactNode, useEffect, useState } from "react";

// https://www.radix-ui.com/themes/docs/overview/layout#standalone-usage
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/layout.css";
import { IconoirProvider } from "iconoir-react";
import { Tooltip } from "radix-ui";

import { ThemeContext, Theme as ThemeType } from "@repo/theme";

import { StackContext } from "../../contexts/StackContext";
import "./ThemeProvider.scss";

export interface ThemeProviderProps {
  children: ReactNode;
}

export enum Color {
  slate = "slate",
  gray = "gray",
  zinc = "zinc",
  neutral = "neutral",
  stone = "stone",
  red = "red",
  orange = "orange",
  amber = "amber",
  yellow = "yellow",
  lime = "lime",
  green = "green",
  emerald = "emerald",
  teal = "teal",
  cyan = "cyan",
  sky = "sky",
  blue = "blue",
  indigo = "indigo",
  violet = "violet",
  purple = "purple",
  fuchsia = "fuchsia",
  pink = "pink",
  rose = "rose",
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") as ThemeType
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
        <Tooltip.Provider delayDuration={50}>
          <ThemeContext value={{ theme: theme, setTheme }}>
            {/* https://www.radix-ui.com/themes/docs/overview/layout#standalone-usage */}
            <Theme>{children}</Theme>
          </ThemeContext>
        </Tooltip.Provider>
      </IconoirProvider>
    </StackContext>
  );
}
