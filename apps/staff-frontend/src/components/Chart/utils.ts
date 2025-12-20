import { ChartConfig } from "./types";

// Common formatters
export const formatters = {
  percent: (value: number, decimals = 1) => `${value.toFixed(decimals)}%`,
  percentRound: (value: number) => `${Math.round(value)}%`,
  number: (value: number) => value.toLocaleString(),
  compact: (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  },
};

// Get theme-aware color
export function getThemeColor(theme: { light: string; dark: string }): string {
  if (typeof window === "undefined") return theme.light;

  const isDark =
    document.body.getAttribute("data-theme") === "dark" ||
    (document.body.getAttribute("data-theme") === null &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return isDark ? theme.dark : theme.light;
}

// Create chart config helper
export function createChartConfig<T extends string>(
  keys: T[],
  options: {
    labels?: Record<T, string>;
    colors?: Record<T, string>;
    themes?: Record<T, { light: string; dark: string }>;
  } = {}
): ChartConfig {
  return keys.reduce((acc, key) => {
    acc[key] = {
      label: options.labels?.[key] || key,
      ...(options.colors?.[key] && { color: options.colors[key] }),
      ...(options.themes?.[key] && { theme: options.themes[key] }),
    };
    return acc;
  }, {} as ChartConfig);
}

// Merge chart configs
export function mergeChartConfig(...configs: ChartConfig[]): ChartConfig {
  return Object.assign({}, ...configs);
}
