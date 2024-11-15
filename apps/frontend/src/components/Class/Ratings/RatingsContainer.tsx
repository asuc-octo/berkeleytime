import React, { useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import { NavArrowDown } from "iconoir-react";
import _ from "lodash";

import { Button, Container } from "@repo/theme";

import UserFeedbackModal from "@/components/UserFeedbackModal";
import ReactSelect from "react-select";
import useClass from "@/hooks/useClass";
import {
  CREATE_RATING,
  GET_AGGREGATED_RATINGS,
  GET_USER_RATINGS,
  READ_COURSE,
} from "@/lib/api";
import { Semester } from "@/lib/api/terms";

import styles from "./Ratings.module.scss";
// TODO: Remove placeholder data before prod
import { placeholderRatingsData } from "./helper/devPlaceholderData";
import {
  MetricName,
  getMetricStatus,
  getMetricTooltip,
  getStatusColor,
} from "./helper/metricsUtil";

const PLACEHOLDER = false;

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
      isAllTime: selectedTerm === "all",
    },
  });

  // Create rating mutation
  const [createRating] = useMutation(CREATE_RATING, {
    refetchQueries: ["GetUserRatings", "GetAggregatedRatings"],
  });

  const availableTerms = React.useMemo(() => {
    if (!courseData?.course?.classes) return [];

    return _.chain(courseData.course.classes)
      .map((classInfo) => ({
        value: `${classInfo.semester} ${classInfo.year}`,
        label: `${classInfo.semester} ${classInfo.year}`,
        semester: classInfo.semester as Semester,
        year: classInfo.year,
      }))
      .uniqBy((term) => `${term.semester}-${term.year}`)
      .orderBy(
        [
          "year",
          (term) => {
            const semesterOrder = {
              [Semester.Spring]: 0,
              [Semester.Summer]: 1,
              [Semester.Fall]: 2,
              [Semester.Winter]: 3,
            };
            return semesterOrder[term.semester as Semester];
          },
        ],
        ["desc", "asc"]
      )
      .value();
  }, [courseData]);

  const userRatings = React.useMemo(() => {
    if (!userRatingsData?.userRatings?.classes) return null;

    return userRatingsData.userRatings.classes.find(
      (classRating: {
        subject: string;
        courseNumber: string;
        semester: Semester;
        year: number;
        classNumber: string;
      }) =>
        classRating.subject === currentClass.subject &&
        classRating.courseNumber === currentClass.courseNumber &&
        classRating.semester === currentClass.semester &&
        classRating.year === currentClass.year &&
        classRating.classNumber === currentClass.number
    );
  }, [userRatingsData, currentClass]);

  const handleSubmitRatings = async (
    ratings: {
      usefulness: number;
      difficulty: number;
      workload: number;
    },
    termInfo: { semester: Semester; year: number }
  ) => {
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
      console.error("Error submitting ratings:", error);
    }
  };

  // Transform aggregated ratings into display format
  // TODO: Remove placeholder data before prod
  const ratingsData = React.useMemo(() => {
    if (PLACEHOLDER) {
      return placeholderRatingsData;
    }
    if (!aggregatedRatings?.aggregatedRatings?.metrics) {
      return null;
    }

    return aggregatedRatings.aggregatedRatings.metrics.map((metric) => {
      const allCategories = [5, 4, 3, 2, 1].map((rating) => {
        const category = metric.categories.find((cat) => cat.value === rating);
        return {
          rating,
          percentage: category ? (category.count / metric.count) * 100 : 0,
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
    }) as RatingDetailProps[];
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

              {/* Replace select dropdown with ReactSelect */}
              <ReactSelect
                options={[{ value: "all", label: "All Terms" }, ...availableTerms]}
                value={availableTerms.find(term => term.value === selectedTerm) || { value: "all", label: "All Terms" }}
                onChange={(option) => setSelectedTerm(option?.value || "all")}
                classNamePrefix="termDropdown" // Prefix for custom styles
                placeholder="Select term"
              />
            </div>
          </div>

        <div className={styles.ratingsContainer}>
          {ratingsData?.map((ratingData) => (
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
          initialRatings={userRatingsData?.userRatings?.classes
            ?.find(
              (c: {
                subject: string;
                courseNumber: string;
                semester: Semester;
                year: number;
                classNumber: string;
              }) =>
                c.subject === currentClass.subject &&
                c.courseNumber === currentClass.courseNumber &&
                c.semester === currentClass.semester &&
                c.year === currentClass.year &&
                c.classNumber === currentClass.number
            )
            ?.metrics?.reduce(
              (
                acc: { [key: string]: number },
                metric: { metricName: string; value: number }
              ) => ({
                ...acc,
                [metric.metricName.toLowerCase()]: metric.value,
              }),
              {
                usefulness: 0,
                difficulty: 0,
                workload: 0,
              }
            )}
        />
      </Container>
    </div>
  );
}

export default RatingsContainer;
