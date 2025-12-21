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
  /** Forces a specific theme, overriding user preferences and system settings */
  forcedTheme?: "light" | "dark";
}

export enum Color {
  Slate = "slate",
  Gray = "gray",
  Zinc = "zinc",
  Neutral = "neutral",
  Stone = "stone",
  Red = "red",
  Orange = "orange",
  Amber = "amber",
  Yellow = "yellow",
  Lime = "lime",
  Green = "green",
  Emerald = "emerald",
  Teal = "teal",
  Cyan = "cyan",
  Sky = "sky",
  Blue = "blue",
  Indigo = "indigo",
  Violet = "violet",
  Purple = "purple",
  Fuchsia = "fuchsia",
  Pink = "pink",
  Rose = "rose",
}

export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(
    () => localStorage.getItem("theme") as ThemeType
  );

  if (forcedTheme) {
    document.body.setAttribute("data-theme", forcedTheme);
  }

  useEffect(() => {
    if (forcedTheme) {
      document.body.setAttribute("data-theme", forcedTheme);
      return;
    }

    if (theme) {
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);
      return;
    }

    localStorage.removeItem("theme");
    document.body.removeAttribute("data-theme");
  }, [theme, forcedTheme]);

  const effectiveTheme = forcedTheme ?? theme;
  const effectiveSetTheme = forcedTheme ? () => {} : setTheme;

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
          <ThemeContext
            value={{ theme: effectiveTheme, setTheme: effectiveSetTheme }}
          >
            {/* https://www.radix-ui.com/themes/docs/overview/layout#standalone-usage */}
            <Theme>{children}</Theme>
          </ThemeContext>
        </Tooltip.Provider>
      </IconoirProvider>
    </StackContext>
  );
}
