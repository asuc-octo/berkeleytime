import { useEffect, useState } from "react";

const usePrefersColorScheme = () => {
  const [value, setValue] = useState<string | null>(
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

export default usePrefersColorScheme;
