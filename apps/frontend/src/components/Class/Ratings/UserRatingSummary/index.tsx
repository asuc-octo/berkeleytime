import { EditPencil, Trash } from "iconoir-react";

import { METRIC_ORDER, MetricName } from "@repo/shared";
import { Badge, Flex, IconButton, Tooltip } from "@repo/theme";

import {
  UserRating,
  formatDate,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "../metricsUtil";
import styles from "./UserRatingSummary.module.scss";

export default function UserRatingSummary({
  userRatings,
  onOpenModal,
  ratingDelete,
}: {
  userRatings: UserRating;
  onOpenModal: (open: boolean) => void;
  ratingDelete: () => void;
}) {
  const sortedMetrics = userRatings.metrics
    .filter((metric) => isMetricRating(MetricName[metric.metricName]))
    .sort((a, b) => {
      const indexA = METRIC_ORDER.indexOf(MetricName[a.metricName]);
      const indexB = METRIC_ORDER.indexOf(MetricName[b.metricName]);
      return indexA - indexB;
    });
  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <div>
          <h3>Your Rating Summary</h3>
          <h5>{formatDate(new Date(userRatings.lastUpdated))}</h5>
        </div>
        <Flex gap="2">
          <Tooltip content="Edit rating">
            <IconButton onClick={() => onOpenModal(true)}>
              <EditPencil />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete rating">
            <IconButton onClick={() => ratingDelete()}>
              <Trash />
            </IconButton>
          </Tooltip>
        </Flex>
      </div>
      <div className={styles.body}>
        <div>
          {sortedMetrics.map((metric) => (
            <div key={metric.metricName} className={styles.section}>
              <div className={styles.metrics}>
                <div className={styles.titleSection}>
                  <h3 className={styles.metric}>{metric.metricName}</h3>
                </div>
                <Badge
                  color={getStatusColor(metric.metricName, metric.value)}
                  label={getMetricStatus(metric.metricName, metric.value)}
                />
                <span
                  className={styles.metricAverage}
                >{`${metric.value}.0 / 5.0`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
