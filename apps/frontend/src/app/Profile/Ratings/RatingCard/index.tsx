import { ArrowRight } from "iconoir-react";
import { Link } from "react-router-dom";

import { METRIC_MAPPINGS, METRIC_ORDER, MetricName } from "@repo/shared";
import { Badge, Button, Card } from "@repo/theme";

import { getStatusColor } from "@/components/Class/Ratings/metricsUtil";
import { useReadCourseTitle } from "@/hooks/api/courses/useReadCourse";
import { UserRatingClass } from "@/lib/api";

import styles from "./RatingCard.module.scss";

interface RatingCardProps {
  rating: UserRatingClass;
}

export function RatingCard({ rating }: RatingCardProps) {
  const { data: course, loading } = useReadCourseTitle(
    rating.subject,
    rating.courseNumber
  );

  const getRatingMetrics = (
    metrics: Array<{ metricName: string; value: number }>
  ) => {
    const ratingMetrics = metrics.filter((metric) => {
      const metricConfig = METRIC_MAPPINGS[metric.metricName as MetricName];
      return metricConfig && metricConfig.isRating === true;
    });

    // Sort metrics according to METRIC_ORDER
    return ratingMetrics.sort((a, b) => {
      const aIndex = METRIC_ORDER.indexOf(a.metricName as MetricName);
      const bIndex = METRIC_ORDER.indexOf(b.metricName as MetricName);
      return aIndex - bIndex;
    });
  };

  return loading ? (
    <></>
  ) : (
    <Card.RootColumn hoverColorChange={false}>
      <Card.ColumnHeader>
        <Card.Body style={{ paddingBottom: 0 }}>
          <Card.Heading>
            {rating.subject} {rating.courseNumber}{" "}
            <span className={styles.semester}>
              {rating.semester} {rating.year}
            </span>
          </Card.Heading>
          <Card.Description className={styles.title}>
            {course?.title}
          </Card.Description>
        </Card.Body>
        <Card.Actions>
          <Link
            to={`/catalog/${rating.year}/${rating.semester}/${rating.subject}/${rating.courseNumber}/${rating.classNumber}/ratings`}
          >
            <Button variant="tertiary" noFill={true}>
              View <ArrowRight />
            </Button>
          </Link>
        </Card.Actions>
      </Card.ColumnHeader>
      <Card.ColumnBody>
        <div className={styles.metricsBlock}>
          {getRatingMetrics(rating.metrics).map((metric) => {
            const metricConfig =
              METRIC_MAPPINGS[metric.metricName as MetricName];
            const status = metricConfig.getStatus(metric.value);
            const statusColor = getStatusColor(
              metric.metricName as MetricName,
              metric.value
            );
            return (
              <div key={metric.metricName} className={styles.metricRow}>
                <span className={styles.metricName}>{metric.metricName}</span>
                <Badge color={statusColor} label={status} />
              </div>
            );
          })}
        </div>
        <p className={styles.lastUpdated}>
          Last updated on {new Date(rating.lastUpdated).toLocaleDateString()}
        </p>
      </Card.ColumnBody>
    </Card.RootColumn>
  );
}
