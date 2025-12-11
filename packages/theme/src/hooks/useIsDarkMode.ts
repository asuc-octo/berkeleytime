import { useEffect, useState } from "react";

import { useTheme } from "./useTheme";

/**
 * Returns whether the app is currently in dark mode.
 * Respects the user's theme override setting, falling back to system preference.
 */
export const useIsDarkMode = (): boolean => {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // null = system default
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // If user has explicit preference, use that
    if (theme === "dark") {
      setIsDarkMode(true);
      return;
    }
    if (theme === "light") {
      setIsDarkMode(false);
      return;
    }

    // Otherwise, listen to system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  return isDarkMode;
};
