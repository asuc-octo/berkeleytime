import { ReactNode } from "react";

import { ColoredSquare } from "@repo/theme";

import styles from "./Chart.module.scss";
import { ChartTooltipContentProps } from "./types";
import { getThemeColor } from "./utils";

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  tooltipConfig = {},
  children,
}: ChartTooltipContentProps) {
  // Custom renderer takes precedence
  if (children) {
    return children({ active, payload, label, config, tooltipConfig });
  }

  if (!active || !payload?.length) return null;

  const {
    hideLabel = false,
    hideIndicator = false,
    indicator = "square",
    labelFormatter,
    valueFormatter,
    nameFormatter,
    header,
    footer,
    separator = "",
    sortBy = "none",
    sortOrder = "desc",
  } = tooltipConfig;

  // Sort payload if needed
  let sortedPayload = [...payload];
  if (sortBy !== "none") {
    sortedPayload.sort((a, b) => {
      const valueA = sortBy === "value" ? a.value : a.name;
      const valueB = sortBy === "value" ? b.value : b.name;
      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  // Format label
  let formattedLabel: ReactNode = label;
  if (labelFormatter) {
    formattedLabel = labelFormatter(label, payload);
  }

  return (
    <div className={styles.tooltipCard}>
      {/* Header section */}
      {header && <div className={styles.tooltipHeader}>{header(payload)}</div>}

      {/* Label section */}
      {!hideLabel && formattedLabel && (
        <div className={styles.tooltipLabel}>{formattedLabel}</div>
      )}

      {/* Data items */}
      <div className={styles.tooltipItems}>
        {sortedPayload.map((item, index) => {
          const dataKey = item.dataKey || item.name;
          const itemConfig = config[dataKey];

          // Format name and value, fall back to payload data if config is missing
          const formattedName = nameFormatter
            ? nameFormatter(item.name, item)
            : itemConfig?.label || item.name || dataKey;

          const formattedValue = valueFormatter
            ? valueFormatter(item.value, item.name, item)
            : item.value;

          // Get color (support theme-aware colors)
          let color = item.stroke || item.fill || item.color;

          if (itemConfig?.theme) {
            color = getThemeColor(itemConfig.theme);
          } else if (itemConfig?.color) {
            color = itemConfig.color;
          }

          return (
            <div
              key={`${item.name ?? dataKey}-${index}`}
              className={styles.tooltipItem}
            >
              <span className={styles.tooltipItemLabel}>
                {!hideIndicator && (
                  <ColoredSquare
                    size="sm"
                    color={color || "var(--border-color)"}
                    variant={indicator}
                    className={styles.tooltipIndicator}
                  />
                )}
                {formattedName}
              </span>
              <span className={styles.tooltipItemValue}>{formattedValue}</span>
            </div>
          );
        })}
      </div>

      {/* Footer section */}
      {footer && <div className={styles.tooltipFooter}>{footer(payload)}</div>}
    </div>
  );
}
