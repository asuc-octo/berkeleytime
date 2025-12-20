import { gql, useQuery } from "@apollo/client";

import styles from "./Stats.module.scss";

const STATS_QUERY = gql`
  query Stats {
    stats {
      users {
        totalCount
        createdLastWeek
        createdLastMonth
      }
      scheduler {
        uniqueUsersWithSchedules
      }
      gradtrak {
        totalCourses
        maxCoursesInOnePlan
        topPlansWithMostCourses {
          planId
          totalCourses
        }
        courseHistogram {
          range
          count
        }
      }
      ratings {
        classesWithRatings
        courseWithMostRatings {
          subject
          courseNumber
          totalRatings
        }
        classWithMostRatings {
          subject
          courseNumber
          semester
          year
          classNumber
          totalRatings
        }
        uniqueCreatedBy
      }
    }
  }
`;

interface StatsData {
  stats: {
    users: {
      totalCount: number;
      createdLastWeek: number;
      createdLastMonth: number;
    };
    scheduler: {
      uniqueUsersWithSchedules: number;
    };
    gradtrak: {
      totalCourses: number;
      maxCoursesInOnePlan: number;
      topPlansWithMostCourses: Array<{
        planId: string;
        totalCourses: number;
      }>;
      courseHistogram: Array<{
        range: string;
        count: number;
      }>;
    };
    ratings: {
      classesWithRatings: number;
      courseWithMostRatings: {
        subject: string;
        courseNumber: string;
        totalRatings: number;
      };
      classWithMostRatings: {
        subject: string;
        courseNumber: string;
        semester: string;
        year: number;
        classNumber: string;
        totalRatings: number;
      };
      uniqueCreatedBy: number;
    };
  };
}

export default function Stats() {
  const { data, loading, error } = useQuery<StatsData>(STATS_QUERY);

  if (loading) {
    return (
      <div className={styles.root}>
        <h1 className={styles.title}>Statistics</h1>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.root}>
        <h1 className={styles.title}>Statistics</h1>
        <div className={styles.error}>Error loading statistics: {error.message}</div>
      </div>
    );
  }

  if (!data?.stats) {
    return (
      <div className={styles.root}>
        <h1 className={styles.title}>Statistics</h1>
        <div className={styles.error}>No data available</div>
      </div>
    );
  }

  const { users, scheduler, gradtrak, ratings } = data.stats;

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Statistics</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Users</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Count</div>
            <div className={styles.statValue}>{users.totalCount.toLocaleString()}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Created Last Week</div>
            <div className={styles.statValue}>
              {users.createdLastWeek.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Created Last Month</div>
            <div className={styles.statValue}>
              {users.createdLastMonth.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Scheduler</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Unique Users with Schedules</div>
            <div className={styles.statValue}>
              {scheduler.uniqueUsersWithSchedules.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Gradtrak</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Courses</div>
            <div className={styles.statValue}>
              {gradtrak.totalCourses.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Max Courses in One Plan</div>
            <div className={styles.statValue}>
              {gradtrak.maxCoursesInOnePlan.toLocaleString()}
            </div>
          </div>
        </div>

        {gradtrak.topPlansWithMostCourses.length > 0 && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Top 3 Plans with Most Courses</h3>
            <div className={styles.list}>
              {gradtrak.topPlansWithMostCourses.map((plan, index) => (
                <div key={plan.planId} className={styles.listItem}>
                  <span className={styles.listItemNumber}>{index + 1}.</span>
                  <span className={styles.listItemText}>
                    Plan {plan.planId}: {plan.totalCourses} courses
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gradtrak.courseHistogram.length > 0 && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Course Distribution</h3>
            <div className={styles.histogram}>
              {gradtrak.courseHistogram.map((bucket) => (
                <div key={bucket.range} className={styles.histogramBar}>
                  <div className={styles.histogramLabel}>{bucket.range}</div>
                  <div className={styles.histogramBarContainer}>
                    <div
                      className={styles.histogramBarFill}
                      style={{
                        width: `${(bucket.count / Math.max(...gradtrak.courseHistogram.map(b => b.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className={styles.histogramValue}>{bucket.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ratings</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Classes with Ratings</div>
            <div className={styles.statValue}>
              {ratings.classesWithRatings.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Unique Users Who Created Ratings</div>
            <div className={styles.statValue}>
              {ratings.uniqueCreatedBy.toLocaleString()}
            </div>
          </div>
        </div>

        {ratings.courseWithMostRatings && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Course with Most Ratings</h3>
            <div className={styles.detailCard}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Course:</span>
                <span className={styles.detailValue}>
                  {ratings.courseWithMostRatings.subject}{" "}
                  {ratings.courseWithMostRatings.courseNumber}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Ratings:</span>
                <span className={styles.detailValue}>
                  {ratings.courseWithMostRatings.totalRatings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {ratings.classWithMostRatings && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Class with Most Ratings</h3>
            <div className={styles.detailCard}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Class:</span>
                <span className={styles.detailValue}>
                  {ratings.classWithMostRatings.subject}{" "}
                  {ratings.classWithMostRatings.courseNumber} - Class{" "}
                  {ratings.classWithMostRatings.classNumber}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Term:</span>
                <span className={styles.detailValue}>
                  {ratings.classWithMostRatings.semester} {ratings.classWithMostRatings.year}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Ratings:</span>
                <span className={styles.detailValue}>
                  {ratings.classWithMostRatings.totalRatings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
