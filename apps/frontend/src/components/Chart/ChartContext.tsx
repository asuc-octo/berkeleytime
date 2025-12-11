import { createContext, useContext } from "react";

import { ChartContextValue } from "./types";

const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart() {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

export { ChartContext };
