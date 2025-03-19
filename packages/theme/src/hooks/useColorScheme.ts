import { useEffect, useState } from "react";

import { Theme } from "@repo/theme";

const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

export const useColorScheme = () => {
  const [value, setValue] = useState<Exclude<Theme, null>>(
    matchMedia.matches ? "dark" : "light"
  );

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) =>
      setValue(event.matches ? "dark" : "light");

    matchMedia.addEventListener("change", handleChange);

    return () => matchMedia.removeEventListener("change", handleChange);
  }, []);

  return value;
};
