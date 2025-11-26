import { ReactNode } from "react";

import { FrameAltEmpty } from "iconoir-react";
import { ResponsiveContainer } from "recharts";

import { ChartContainer as ThemeChartContainer, ChartConfig } from "@/components/Chart";

import { useChartHeight } from "../hooks/useChartHeight";
import { useChartWidth } from "../hooks/useChartWidth";

import styles from "./ChartContainer.module.scss";

interface ChartContainerProps {
  config: ChartConfig;
  hasData: boolean;
  children: (chartWidth: number, chartHeight: number) => ReactNode;
}

export function ChartContainer({
  config,
  hasData,
  children,
}: ChartContainerProps) {
  const { containerRef, chartWidth } = useChartWidth();
  const chartHeight = useChartHeight(chartWidth);

  return (
    <div className={styles.view} ref={containerRef}>
      <ThemeChartContainer config={config} className={styles.chart}>
        <ResponsiveContainer width="100%" height={chartHeight || 400}>
          {children(chartWidth, chartHeight)}
        </ResponsiveContainer>
        {!hasData && (
          <div className={styles.empty}>
            <FrameAltEmpty height={42} width={42} />
            <div className={styles.emptyText}>
              You have not added
              <br />
              any classes yet
            </div>
          </div>
        )}
      </ThemeChartContainer>
    </div>
  );
}
