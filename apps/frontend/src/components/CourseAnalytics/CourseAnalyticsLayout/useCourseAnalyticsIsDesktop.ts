import { useEffect, useState } from "react";

export const useCourseAnalyticsIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 992);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(width > 992px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
};
