/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip } from "recharts";
import type { TooltipProps } from "recharts";

import { useChart } from "./ChartContext";
import { ChartTooltipContent } from "./ChartTooltipContent";
import { ChartTooltipConfig } from "./types";

interface ChartTooltipProps extends Omit<TooltipProps<any, any>, "content"> {
  tooltipConfig?: ChartTooltipConfig;
  content?: React.ComponentType<any> | React.ReactElement;
}

export function ChartTooltip({
  tooltipConfig,
  content,
  cursor = { fill: "var(--border-color)", fillOpacity: 0.5 },
  ...props
}: ChartTooltipProps) {
  const { config } = useChart();

  // Use custom content if provided, otherwise use default
  const tooltipContent =
    content ||
    ((contentProps: any) => (
      <ChartTooltipContent
        {...contentProps}
        config={config}
        tooltipConfig={tooltipConfig}
      />
    ));

  return <Tooltip cursor={cursor} content={tooltipContent} {...props} />;
}
