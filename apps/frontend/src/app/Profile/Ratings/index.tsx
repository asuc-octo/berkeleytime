import { useState, useMemo } from "react";
import { Search } from "iconoir-react";

import { useUserRatings } from "@/hooks/api/ratings";
import { METRIC_MAPPINGS, MetricName, METRIC_ORDER } from "@repo/shared";
import styles from "./Ratings.module.scss";

export default function Ratings() {
  const [searchQuery, setSearchQuery] = useState("");
  const { ratings, loading, error } = useUserRatings();

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    if (!searchQuery.trim()) return ratings;

    const query = searchQuery.toLowerCase().trim();
    return ratings.filter((rating) => {
      const searchableText = `${rating.subject} ${rating.courseNumber} ${rating.semester} ${rating.year}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [ratings, searchQuery]);

  const getRatingMetrics = (metrics: Array<{ metricName: string; value: number }>) => {
    const ratingMetrics = metrics.filter(
      (metric) => {
        const metricConfig = METRIC_MAPPINGS[metric.metricName as MetricName];
        return metricConfig && metricConfig.isRating === true;
      }
    );

    // Sort metrics according to METRIC_ORDER
    return ratingMetrics.sort((a, b) => {
      const aIndex = METRIC_ORDER.indexOf(a.metricName as MetricName);
      const bIndex = METRIC_ORDER.indexOf(b.metricName as MetricName);
      return aIndex - bIndex;
    });
  };

  return (
    <div>
      <h1>Your Ratings</h1>
      <div className={styles.root}>
        <div className={styles.searchGroup}>
          <label htmlFor="ratingsSearch" className={styles.searchIcon}>
            <Search />
          </label>
          <input
            id="ratingsSearch"
            className={styles.searchInput}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Ratings..."
            autoComplete="off"
          />
        </div>

        {loading && <p>Loading your ratings...</p>}
        {error && <p>Error loading ratings: {error.message}</p>}
        {filteredRatings.length === 0 && searchQuery && !loading && (
          <p>No ratings found matching "{searchQuery}"</p>
        )}
        {filteredRatings.length > 0 && (
          <div className={styles.ratingsGrid}>
            {filteredRatings.map((rating) => (
              <div 
                key={`${rating.subject}-${rating.courseNumber}-${rating.lastUpdated}`} 
                className={styles.ratingCard}
              >
                <div className={styles.courseHeader}>
                  <div className={styles.courseInfo}>
                    <span className={styles.courseName}>{rating.subject} {rating.courseNumber}</span>
                    <span className={styles.semester}>{rating.semester} {rating.year}</span>
                  </div>
                  <a href="#" className={styles.viewButton}>View {'->'}</a>
                </div>

                <div className={styles.metricsBlock}>
                  {getRatingMetrics(rating.metrics).map((metric) => {
                    const metricConfig = METRIC_MAPPINGS[metric.metricName as MetricName];
                    return (
                      <div key={metric.metricName} className={styles.metricRow}>
                        <span className={styles.metricName}>{metric.metricName}</span>
                        <span className={styles.metricValue}>
                          {metricConfig.getStatus(metric.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className={styles.lastUpdated}>Last updated on {new Date(rating.lastUpdated).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  