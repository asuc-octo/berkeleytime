import { useLayoutEffect, useRef, useState } from "react";

export const useChartWidth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Get initial width immediately to prevent layout shift
    const initialWidth = containerRef.current.getBoundingClientRect().width;
    if (initialWidth > 0) {
      setChartWidth(initialWidth);
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 0;
      setChartWidth(width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return { containerRef, chartWidth };
};
