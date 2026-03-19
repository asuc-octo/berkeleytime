import { useEffect, useState } from "react";

export default function useMinWidth(breakpoint: number) {
  const [matches, setMatches] = useState(() => window.innerWidth > breakpoint);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(width > ${breakpoint}px)`);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return matches;
}
