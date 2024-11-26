import ratingStyles from "../Ratings.module.scss";
import {
  MetricName,
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
  return (
    <div>
      {userRatings.metrics
        .filter((metric) => {
          return isMetricRating(MetricName[metric.metricName]);
        })
        .map((metric) => (
          <div
            key={metric.metricName}
            className={ratingStyles.userRatingSection}
          >
            <div className={ratingStyles.titleSection}>
              <h3 className={ratingStyles.title}>{metric.metricName}</h3>
            </div>
            <span className={ratingStyles[getStatusColor(metric.value)]}>
              {getMetricStatus(metric.metricName, metric.value)}
            </span>
          </div>
        ))}
    </div>
  );
}
