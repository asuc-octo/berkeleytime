import { ReactNode } from "react";

import styles from "./AnalyticsCard.module.scss";

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
  children,
}: AnalyticsCardProps) {
  const showMetrics = currentValue !== undefined || currentValueLabel !== undefined;
  const isPositive = (absoluteChange ?? percentChange ?? 0) >= 0;

  // Format the change text: "+3.8% (30d)"
  const formatChangeText = () => {
    if (percentChange !== undefined) {
      const sign = isPositive ? "+" : "";
      return `${sign}${percentChange.toFixed(1)}% (${changeTimescale})`;
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
      <div className={styles.content}>{children}</div>
    </div>
  );
}
