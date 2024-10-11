import { useEffect, useState } from "react";

import { Theme } from "@repo/theme";

export const usePrefersColorScheme = () => {
  const [value, setValue] = useState<Exclude<Theme, null>>(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) =>
      setValue(event.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return value;
};
