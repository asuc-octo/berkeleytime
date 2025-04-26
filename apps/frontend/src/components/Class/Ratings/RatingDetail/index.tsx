import { CSSProperties, useEffect, useState } from "react";

import { InfoCircle, NavArrowDown } from "iconoir-react";

import { MetricName } from "@repo/shared";
import { Badge, Tooltip } from "@repo/theme";

import { getMetricTooltip } from "../metricsUtil";
import styles from "./RatingDetail.module.scss";

export interface RatingDetailProps {
  metric: MetricName;
  stats: {
    rating: number;
    barPercentage: number;
    count: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
  weightedAverage: number;
}

// React Components

export function RatingDetailView({
  metric,
  stats,
  status,
  statusColor,
  reviewCount,
  weightedAverage,
}: RatingDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExpanded) {
      setShouldAnimate(false);
      requestAnimationFrame(() => {
        timer = setTimeout(() => {
          setShouldAnimate(true);
        }, 50);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExpanded]);

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleAndStatusSection}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{metric}</h3>
            <Tooltip content={`${getMetricTooltip(metric)}`}>
              <span className={styles.info}>
                <InfoCircle width={14} height={14} />
              </span>
            </Tooltip>
          </div>
          <Badge color={statusColor} label={status} />
          <span className={styles.metricAverage}>
            {`${weightedAverage.toFixed(1)} / 5.0`}
          </span>
        </div>
        <div className={styles.statusSection}>
          <NavArrowDown
            className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}
          />
        </div>
      </div>
      {isExpanded && (
        <div className={styles.ratingContent}>
          {stats.map((stat, index) => (
            <div
              key={stat.rating}
              className={styles.statRow}
              style={{ "--delay": `${index * 60}ms` } as CSSProperties}
            >
              <span className={styles.metric}>{stat.rating}</span>
              <Tooltip
                content={`${Math.round((stat.count * 100) / reviewCount)}% of users left this rating`}
              >
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{
                      width: shouldAnimate ? `${stat.barPercentage}%` : "0%",
                      transitionDelay: `${index * 60}ms`,
                    }}
                  />
                </div>
              </Tooltip>
              <span
                className={`${styles.count} ${stat.count === 0 ? styles.empty : ""}`}
              >
                {shouldAnimate ? `${stat.count}` : "0%"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
