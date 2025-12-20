import { ReactNode } from "react";

import { Select } from "@repo/theme";

import styles from "./AnalyticsCard.module.scss";

export type TimeRange = "7d" | "30d" | "90d";
export type Granularity = "hour" | "day";

interface AnalyticsCardProps {
  title: string;
  description?: string;
  currentValue?: number;
  currentValuePrefix?: string;
  currentValueLabel?: string;
  absoluteChange?: number;
  percentChange?: number;
  changeTimescale?: string;
  subtitle?: string;
  subtitlePositive?: boolean;
  showTimeRangeSelector?: boolean;
  timeRange?: TimeRange;
  onTimeRangeChange?: (value: TimeRange) => void;
  granularity?: Granularity;
  onGranularityChange?: (value: Granularity) => void;
  customControls?: ReactNode;
  children: ReactNode;
}

export function AnalyticsCard({
  title,
  description,
  currentValue,
  currentValuePrefix,
  currentValueLabel,
  absoluteChange,
  percentChange,
  changeTimescale = "7d",
  subtitle,
  subtitlePositive,
  showTimeRangeSelector,
  timeRange = "30d",
  onTimeRangeChange,
  granularity = "day",
  onGranularityChange,
  customControls,
  children,
}: AnalyticsCardProps) {
  const showMetrics = currentValue !== undefined || currentValueLabel !== undefined;
  const isPositive = (absoluteChange ?? percentChange ?? 0) >= 0;

  // Format the change text: "+3.8% vs prev. 30d"
  const formatChangeText = () => {
    if (percentChange !== undefined) {
      const sign = isPositive ? "+" : "";
      return `${sign}${percentChange.toFixed(1)}% vs prev. ${changeTimescale}`;
    }
    return null;
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {showMetrics && (
          <div className={styles.headerRight}>
            <div className={styles.currentValue}>
              {currentValuePrefix}{currentValue !== undefined && currentValue.toLocaleString()}{currentValueLabel && (currentValue !== undefined ? ` ${currentValueLabel}` : currentValueLabel)}
            </div>
            {subtitle ? (
              <div
                className={styles.percentChange}
                style={{ color: subtitlePositive !== undefined
                  ? (subtitlePositive ? "var(--green-500)" : "var(--red-500)")
                  : "var(--label-color)"
                }}
              >
                {subtitle}
              </div>
            ) : formatChangeText() ? (
              <div
                className={styles.percentChange}
                style={{ color: isPositive ? "var(--green-500)" : "var(--red-500)" }}
              >
                {formatChangeText()}
              </div>
            ) : null}
          </div>
        )}
      </div>
      {(showTimeRangeSelector || customControls) && (
        <div className={styles.controls}>
          {showTimeRangeSelector && (
            <>
              <span className={styles.controlLabel}>Time range</span>
              <Select
                value={timeRange}
                onChange={(val) => onTimeRangeChange?.(val as TimeRange)}
                options={[
                  { value: "7d", label: "7d" },
                  { value: "30d", label: "30d" },
                  { value: "90d", label: "90d" },
                ]}
                style={{ width: "fit-content", minHeight: 24, height: 24, padding: "0 8px", fontSize: 12 }}
              />
              {onGranularityChange && (
                <>
                  <span className={styles.controlLabel}>Granularity</span>
                  <Select
                    value={granularity}
                    onChange={(val) => onGranularityChange(val as Granularity)}
                    options={[
                      { value: "hour", label: "Hour" },
                      { value: "day", label: "Day" },
                    ]}
                    style={{ width: "fit-content", minHeight: 24, height: 24, padding: "0 8px", fontSize: 12 }}
                  />
                </>
              )}
            </>
          )}
          {customControls}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
