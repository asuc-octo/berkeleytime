import { ReactNode } from "react";

// Chart configuration for a single data series
export interface ChartDataConfig {
  label: string;
  icon?: ReactNode;
  color?: string;
  theme?: {
    light: string;
    dark: string;
  };
}

// Complete chart configuration
export interface ChartConfig {
  [key: string]: ChartDataConfig;
}

// Tooltip customization options
export interface ChartTooltipConfig {
  // Display options
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "square" | "circle";

  // Custom formatters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labelFormatter?: (label: any, payload: any[]) => ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueFormatter?: (value: any, name: string, payload: any) => ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nameFormatter?: (name: string, payload: any) => ReactNode;

  // Layout
  separator?: string;
  sortBy?: "value" | "name" | "none";
  sortOrder?: "asc" | "desc";

  // Custom sections
  header?: (payload: any[]) => ReactNode;
  footer?: (payload: any[]) => ReactNode;
}

// Main tooltip content props
export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  config: ChartConfig;
  tooltipConfig?: ChartTooltipConfig;
  // Allow custom rendering
  children?: (props: ChartTooltipContentProps) => ReactNode;
}

// Chart context for theme-aware rendering
export interface ChartContextValue {
  config: ChartConfig;
}
