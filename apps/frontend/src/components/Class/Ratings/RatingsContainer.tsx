import React, { useState } from "react";
import { Button, Container } from "@repo/theme";
import { useQuery, useMutation, gql } from "@apollo/client";
import UserFeedbackModal from "@/components/UserFeedbackModal";
import useClass from "@/hooks/useClass";
import { NavArrowDown } from "iconoir-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import _ from "lodash";
import styles from "./Ratings.module.scss";
import { READ_COURSE } from "@/lib/api";
import { Semester } from "@/lib/api/terms";

enum MetricName {
    Usefulness = "Usefulness",
    Difficulty = "Difficulty",
    Workload = "Workload",
    Attendance = "Attendance",
    Recording = "Recording"
  }
  // Helper functions to provide tooltip text, status, and status color
function getMetricTooltip(metricName: MetricName): string {
    switch (metricName) {
      case MetricName.Usefulness:
        return "This refers to how beneficial the course is for academic, professional, or personal growth.";
      case MetricName.Difficulty:
        return "This indicates the level of challenge students face in understanding course material.";
      case MetricName.Workload:
        return "This represents the time and effort required for course assignments and activities.";
      case MetricName.Attendance:
        return "Indicates if attendance is required for the course.";
      case MetricName.Recording:
        return "Indicates if the lectures are recorded for the course.";
      default:
        return "";
    }
  }
  
  function getMetricStatus(metricName: MetricName, weightedAverage: number): string {
    switch (metricName) {
      case MetricName.Usefulness:
        return weightedAverage >= 4 ? "Very Useful" : weightedAverage >= 2 ? "Moderately Useful" : "Not Useful";
      case MetricName.Difficulty:
        return weightedAverage >= 4 ? "Very Difficult" : weightedAverage >= 2 ? "Moderately Difficult" : "Easy";
      case MetricName.Workload:
        return weightedAverage >= 4 ? "Very Heavy" : weightedAverage >= 2 ? "Moderate Workload" : "Light Workload";
      case MetricName.Attendance:
        return weightedAverage > 0 ? "Required" : "Not Required";
      case MetricName.Recording:
        return weightedAverage > 0 ? "Recorded" : "Not Recorded";
      default:
        return "";
    }
  }
  
  function getStatusColor(weightedAverage: number): string {
    if (weightedAverage >= 4) {
      return "statusGreen";
    } else if (weightedAverage >= 2) {
      return "statusOrange";
    } else {
      return "statusRed";
    }
  }
  
  
  const GET_AGGREGATED_RATINGS = gql`
    query GetAggregatedRatings(
      $subject: String!
      $courseNumber: String!
      $semester: Semester!
      $year: Int!
      $classNumber: String!
      $isAllTime: Boolean!
    ) {
      aggregatedRatings(
        subject: $subject
        courseNumber: $courseNumber
        semester: $semester
        year: $year
        classNumber: $classNumber
        isAllTime: $isAllTime
      ) {
        metrics {
          metricName
          count
          weightedAverage
          categories {
            value
            count
          }
        }
      }
    }
  `;
  
  const CREATE_RATING = gql`
    mutation CreateRating(
      $subject: String!
      $courseNumber: String!
      $semester: Semester!
      $year: Int!
      $classNumber: String!
      $metricName: MetricName!
      $value: Int!
    ) {
      createRating(
        subject: $subject
        courseNumber: $courseNumber
        semester: $semester
        year: $year
        classNumber: $classNumber
        metricName: $metricName
        value: $value
      ) {
        metrics {
          metricName
          weightedAverage
        }
      }
    }
  `;
  
  const GET_USER_RATINGS = gql`
    query GetUserRatings {
      userRatings {
        classes {
          subject
          courseNumber
          semester
          year
          classNumber
          metrics {
            metricName
            value
          }
        }
      }
    }
  `;

interface RatingDetailProps {
  title: string;
  tooltip: string;
  stats: {
    rating: number;
    percentage: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
}

function RatingDetail({
  title,
  tooltip,
  stats,
  status,
  statusColor,
  reviewCount,
}: RatingDetailProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  React.useEffect(() => {
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
    <div className={styles.ratingSection}>
      <div
        className={styles.ratingHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className={styles.info}>ⓘ</span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={styles.tooltipContent}
                side="bottom"
                sideOffset={8}
                collisionPadding={8}
              >
                <Tooltip.Arrow className={styles.arrow} />
                <div>
                  <h4 className={styles.tooltipTitle}>{title}</h4>
                  <p className={styles.tooltipDescription}>{tooltip}</p>
                </div>
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
        <div className={styles.statusSection}>
          <span className={styles[statusColor]}>{status}</span>
          <span className={styles.reviewCount}>({reviewCount} reviews)</span>
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
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <span className={styles.rating}>{stat.rating}</span>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{
                    width: shouldAnimate ? `${stat.percentage}%` : "0%",
                    transitionDelay: `${index * 60}ms`,
                  }}
                />
              </div>
              <span className={styles.percentage}>
                {shouldAnimate ? `${stat.percentage}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RatingsContainer() {
    const [isModalOpen, setModalOpen] = useState(false);
    const { class: currentClass } = useClass();
    const [selectedTerm, setSelectedTerm] = useState("all");
  
    // Course data for terms
    const { data: courseData, loading: courseLoading } = useQuery(READ_COURSE, {
      variables: {
        subject: currentClass.subject,
        number: currentClass.courseNumber,
      },
    });
  
    // Get user's existing ratings
    const { data: userRatingsData } = useQuery(GET_USER_RATINGS);
  
    // Get aggregated ratings for display
    const { data: aggregatedRatings } = useQuery(GET_AGGREGATED_RATINGS, {
      variables: {
        subject: currentClass.subject,
        courseNumber: currentClass.courseNumber,
        semester: currentClass.semester,
        year: currentClass.year,
        classNumber: currentClass.number,
        isAllTime: selectedTerm === "all"
      }
    });
  
    // Create rating mutation
    const [createRating] = useMutation(CREATE_RATING, {
      refetchQueries: [
        'GetUserRatings',
        'GetAggregatedRatings'
      ]
    });
  
    const availableTerms = React.useMemo(() => {
      if (!courseData?.course?.classes) return [];
  
      return _.chain(courseData.course.classes)
        .map(classInfo => ({
          value: `${classInfo.semester} ${classInfo.year}`,
          label: `${classInfo.semester} ${classInfo.year}`,
          semester: classInfo.semester as Semester,
          year: classInfo.year
        }))
        .uniqBy(term => `${term.semester}-${term.year}`)
        .orderBy(['year', term => {
          const semesterOrder = {
            [Semester.Spring]: 0,
            [Semester.Summer]: 1,
            [Semester.Fall]: 2,
            [Semester.Winter]: 3
          };
          return semesterOrder[term.semester as Semester];
        }], ['desc', 'asc'])
        .value();
    }, [courseData]);
  
    const userRatings = React.useMemo(() => {
      if (!userRatingsData?.userRatings?.classes) return null;
  
      return userRatingsData.userRatings.classes.find(
        classRating => 
          classRating.subject === currentClass.subject &&
          classRating.courseNumber === currentClass.courseNumber &&
          classRating.semester === currentClass.semester &&
          classRating.year === currentClass.year &&
          classRating.classNumber === currentClass.number
      );
    }, [userRatingsData, currentClass]);
  
    const handleSubmitRatings = async (ratings: {
      usefulness: number;
      difficulty: number;
      workload: number;
    }, termInfo: { semester: Semester; year: number }) => {
        console.log("Submitting ratings:", ratings, "for term:", termInfo);
      try {
        await Promise.all([
          createRating({
            variables: {
                subject: currentClass.subject,
                courseNumber: currentClass.courseNumber,
                semester: termInfo.semester,
                year: termInfo.year,
                classNumber: currentClass.number,
                metricName: MetricName.Usefulness,
                value: ratings.usefulness,
            },
          }),
          createRating({
            variables: {
                subject: currentClass.subject,
                courseNumber: currentClass.courseNumber,
                semester: termInfo.semester,
                year: termInfo.year,
                classNumber: currentClass.number,
                metricName: MetricName.Difficulty,
                value: ratings.difficulty,
            },
          }),
          createRating({
            variables: {
                subject: currentClass.subject,
                courseNumber: currentClass.courseNumber,
                semester: termInfo.semester,
                year: termInfo.year,
                classNumber: currentClass.number,
                metricName: MetricName.Workload,
                value: ratings.workload,
            },
          }),
        ]);
        
        setModalOpen(false);
      } catch (error) {
        console.error('Error submitting ratings:', error);
      }
    };
  
    const defaultRatingsData = [
      {
        title: "Usefulness",
        tooltip:
          "This refers to how beneficial a course is in helping students achieve their academic, professional, or personal goals.",
        stats: [
          { rating: 5, percentage: 56 },
          { rating: 4, percentage: 16 },
          { rating: 3, percentage: 11 },
          { rating: 2, percentage: 6 },
          { rating: 1, percentage: 11 },
        ],
        status: "Very Useful",
        statusColor: "statusGreen",
        reviewCount: 218,
      },
      {
        title: "Difficulty",
        tooltip:
          "This indicates the level of challenge students experience in understanding and completing course material.",
        stats: [
          { rating: 5, percentage: 30 },
          { rating: 4, percentage: 40 },
          { rating: 3, percentage: 20 },
          { rating: 2, percentage: 5 },
          { rating: 1, percentage: 5 },
        ],
        status: "Moderately Difficult",
        statusColor: "statusOrange",
        reviewCount: 218,
      },
      {
        title: "Workload",
        tooltip:
          "This represents the time and effort required to complete course assignments, readings, and other activities.",
        stats: [
          { rating: 5, percentage: 25 },
          { rating: 4, percentage: 35 },
          { rating: 3, percentage: 25 },
          { rating: 2, percentage: 10 },
          { rating: 1, percentage: 5 },
        ],
        status: "Moderately Workload",
        statusColor: "statusOrange",
        reviewCount: 218,
      },
    ];

    // Transform aggregated ratings into display format
    const ratingsData = React.useMemo(() => {
        if (!aggregatedRatings?.aggregatedRatings?.metrics) {
          return defaultRatingsData;
        }

        return aggregatedRatings.aggregatedRatings.metrics.map(metric => {
          const allCategories = [5, 4, 3, 2, 1].map(rating => {
            const category = metric.categories.find(cat => cat.value === rating);
            return {
              rating,
              percentage: category ? (category.count / metric.count * 100) : 0,
            };
          });

          return {
            title: metric.metricName,
            tooltip: getMetricTooltip(metric.metricName),
            stats: allCategories,
            status: getMetricStatus(metric.metricName, metric.weightedAverage),
            statusColor: getStatusColor(metric.weightedAverage),
            reviewCount: metric.count,
          };
        });
    }, [aggregatedRatings]);

    if (courseLoading) {
        return <div>Loading course data...</div>;
    }
  
    return (
      <div className={styles.root}>
        <Container size="sm">
          <div className={styles.header}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button onClick={() => setModalOpen(true)}>Add a review</Button>
              <select
                className={styles.termSelect}
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="all">All Terms</option>
                {availableTerms.map((term) => (
                  <option 
                    key={`${term.semester}-${term.year}`} 
                    value={term.value}
                  >
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          <div className={styles.ratingsContainer}>
            {ratingsData.map((ratingData) => (
              <RatingDetail key={ratingData.title} {...ratingData} />
            ))}
          </div>
  
          <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Rate Course"
          currentClass={currentClass}
          availableTerms={availableTerms}
          onSubmit={handleSubmitRatings}
          initialRatings={userRatingsData?.userRatings?.classes?.find(
            c => 
              c.subject === currentClass.subject &&
              c.courseNumber === currentClass.courseNumber &&
              c.semester === currentClass.semester &&
              c.year === currentClass.year &&
              c.classNumber === currentClass.number
          )?.metrics?.reduce((acc, metric) => ({
            ...acc,
            [metric.metricName.toLowerCase()]: metric.value
          }), {
            usefulness: 0,
            difficulty: 0,
            workload: 0
          })}
        />
        </Container>
      </div>
    );
  }
  
  export default RatingsContainer;
