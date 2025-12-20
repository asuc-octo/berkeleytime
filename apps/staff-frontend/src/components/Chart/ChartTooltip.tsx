import { Tooltip } from "recharts";
import type { TooltipProps, ContentType } from "recharts/types/component/Tooltip";

import { useChart } from "./ChartContext";
import { ChartTooltipContent } from "./ChartTooltipContent";
import { ChartTooltipConfig } from "./types";

interface ChartTooltipProps extends Omit<TooltipProps<any, any>, "content"> {
  tooltipConfig?: ChartTooltipConfig;
  content?: ContentType<any, any>;
}

export function ChartTooltip({
  tooltipConfig,
  content,
  cursor = { fill: "var(--border-color)", fillOpacity: 0.5 },
  ...props
}: ChartTooltipProps) {
  const { config } = useChart();

  // Use custom content if provided, otherwise use default
  const tooltipContent: ContentType<any, any> =
    content ??
    (({ payload, label, active }) => (
      <ChartTooltipContent
        payload={payload}
        label={label}
        active={active}
        config={config}
        tooltipConfig={tooltipConfig}
      />
    ));

  return <Tooltip cursor={cursor} content={tooltipContent} {...props} />;
}
