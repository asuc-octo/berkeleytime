import { METRIC_ORDER, MetricName } from "@repo/shared";

import ratingStyles from "../Ratings.module.scss";
import {
  UserRating,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "../helper/metricsUtil";

export default function UserRatingSummary({
  userRatings,
}: {
  userRatings: UserRating;
}) {
  const sortedMetrics = userRatings.metrics
    .filter((metric) => isMetricRating(MetricName[metric.metricName]))
    .sort((a, b) => {
      const indexA = METRIC_ORDER.indexOf(MetricName[a.metricName]);
      const indexB = METRIC_ORDER.indexOf(MetricName[b.metricName]);
      return indexA - indexB;
    });

  return (
    <div>
      {sortedMetrics.map((metric) => (
        <div key={metric.metricName} className={ratingStyles.userRatingSection}>
          <div className={ratingStyles.userRationSectionMetrics}>
            <div className={ratingStyles.titleSection}>
              <h3 className={ratingStyles.title}>{metric.metricName}</h3>
            </div>
            <span
              className={
                ratingStyles[getStatusColor(metric.metricName, metric.value)]
              }
            >
              {getMetricStatus(metric.metricName, metric.value)}
            </span>
            <span className={ratingStyles.metricAverage}>{`${metric.value}.0 / 5.0`}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
