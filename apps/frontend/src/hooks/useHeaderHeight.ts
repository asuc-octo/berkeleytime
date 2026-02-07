import { useEffect, useRef, useState } from "react";

const HEADER_HEIGHT_VAR = "--header-height";
const DEFAULT_HEIGHT = 90;

/**
 * Hook that measures the header element's height using ResizeObserver
 * and updates the --header-height CSS variable on document root.
 *
 * This enables dynamic layout adjustments when banners appear/disappear.
 */
export function useHeaderHeight() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) return;

    const updateHeight = () => {
      const newHeight = element.offsetHeight;
      setHeight(newHeight);
      document.documentElement.style.setProperty(
        HEADER_HEIGHT_VAR,
        `${newHeight}px`
      );
    };

    updateHeight(); // Initial measurement

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { headerRef, height };
}
