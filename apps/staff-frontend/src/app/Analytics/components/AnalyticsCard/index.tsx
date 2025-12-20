import { ReactNode } from "react";

import styles from "./AnalyticsCard.module.scss";

interface AnalyticsCardProps {
  title: string;
  description?: string;
  currentValue?: number;
  currentValuePrefix?: string;
  currentValueLabel?: string;
  percentChange?: number;
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
  percentChange,
  subtitle,
  subtitlePositive,
  children,
}: AnalyticsCardProps) {
  const showMetrics = currentValue !== undefined || currentValueLabel !== undefined;
  const isPositive = (percentChange ?? 0) >= 0;

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
            ) : percentChange !== undefined ? (
              <div
                className={styles.percentChange}
                style={{ color: isPositive ? "var(--green-500)" : "var(--red-500)" }}
              >
                {isPositive ? "+" : ""}{percentChange.toFixed(1)}% (7d)
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
