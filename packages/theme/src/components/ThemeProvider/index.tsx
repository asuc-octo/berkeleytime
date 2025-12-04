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

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") as ThemeType
  );

  // Sync theme across tabs/iframes when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        setTheme(e.newValue as ThemeType);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
