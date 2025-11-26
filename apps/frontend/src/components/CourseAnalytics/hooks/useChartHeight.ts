import { useMemo } from "react";

export const useChartHeight = (chartWidth: number) => {
  return useMemo(() => {
    if (chartWidth > 1000) return 550;
    if (chartWidth >= 600) return 400;
    return 250;
  }, [chartWidth]);
};
