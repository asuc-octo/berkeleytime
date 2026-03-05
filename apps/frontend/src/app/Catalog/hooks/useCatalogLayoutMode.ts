import { useEffect, useState } from "react";

import type { CatalogLayoutMode } from "@/components/ClassBrowser/context/LayoutContext";

// Re-export so existing imports keep working
export type { CatalogLayoutMode } from "@/components/ClassBrowser/context/LayoutContext";

const useMinWidth = (breakpoint: number) => {
  const [matches, setMatches] = useState(() => window.innerWidth > breakpoint);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(width > ${breakpoint}px)`);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return matches;
};

export default function useCatalogLayoutMode(): CatalogLayoutMode {
  const isAbove992 = useMinWidth(992);
  const isAbove1400 = useMinWidth(1400);

  if (isAbove1400) return "full";
  if (isAbove992) return "semi-compact";
  return "compact";
}
