import { CSSProperties, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { InfoCircle, NavArrowDown } from "iconoir-react";

import { MetricName } from "@repo/shared";
import { Badge, Color, Tooltip } from "@repo/theme";

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
  statusColor: Color;
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

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      // Also clear hover timer on unmount or collapse
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isExpanded]);

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleAndStatusSection}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{metric}</h3>
            <Tooltip
              trigger={
                <span className={styles.info}>
                  <InfoCircle width={14} height={14} />
                </span>
              }
              title={`${getMetricTooltip(metric)}`}
            />
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
                trigger={
                  <div
                    className={styles.barContainer}
                    onMouseEnter={() => {
                      // Clear any existing timer
                      if (hoverTimerRef.current) {
                        clearTimeout(hoverTimerRef.current);
                      }
                      // Set timer to delay defocus effect by 400ms
                      hoverTimerRef.current = setTimeout(() => {
                        setHoveredIndex(index);
                        hoverTimerRef.current = null;
                      }, 400);
                    }}
                    onMouseLeave={() => {
                      // Clear timer if hover was less than 400ms
                      if (hoverTimerRef.current) {
                        clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = null;
                      }
                      // Immediately clear defocus effect
                      setHoveredIndex(null);
                    }}
                  >
                  <div
                    className={classNames(styles.bar, {
                      [styles.inactiveBar]:
                        hoveredIndex !== null &&
                        hoveredIndex !== index &&
                        stat.count > 0,
                    })}
                    style={{
                      width: shouldAnimate ? `${stat.barPercentage}%` : "0%",
                      "--width-delay": `${index * 60}ms`,
                    } as CSSProperties}
                  />
                  </div>
                }
                content={
                  <>
                    <span
                      style={{ color: "var(--blue-500)" }}
                    >{`${Math.round((stat.count * 100) / reviewCount)}%`}</span>
                    {` of users left this rating`}
                  </>
                }
                hasArrow={false}
              />
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
