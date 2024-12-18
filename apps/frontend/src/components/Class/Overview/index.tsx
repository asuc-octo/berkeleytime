import {
  QuestionMark,
  User,
  UserXmark,
  VideoCamera,
  VideoCameraOff,
} from "iconoir-react";
import _ from "lodash";
import { Link } from "react-router-dom";

import {
  CONSENSUS_THRESHOLD,
  METRIC_MAPPINGS,
  MINIMUM_RESPONSES_THRESHOLD,
  MetricName,
} from "@repo/shared";

import Details from "@/components/Details";
import CourseContext from "@/contexts/CourseContext";
import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import useCourse from "@/hooks/useCourse";
import { signIn } from "@/lib/api";
import { ICourse } from "@/lib/api";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();
  return (
    <CourseContext.Provider value={{ course: _class.course }}>
      <div className={styles.root}>
        <Details {..._class.primarySection.meetings[0]} />
        <p className={styles.userSubmissionLabel}>Description</p>
        <p className={styles.userSubmissionDescription}>
          {_class.description ?? _class.course.description}
        </p>
        <AttendanceRequirements />
      </div>
    </CourseContext.Provider>
  );
}

// first check that there is at least 1 metric with over threshold responses
// if so, then run a local check for each metric to get what to display
function AttendanceRequirements() {
  const { data: user } = useReadUser();
  const { course: _course } = useCourse();
  const handleFeedbackClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      const redirectPath = `${currentPath}/ratings?feedbackModal=true`;
      signIn(redirectPath);
    }
  };
  const responses = {
    Recording: getResponse(_course, MetricName.Recording),
    Attendance: getResponse(_course, MetricName.Attendance),
  };
  const atLeastOneConsensus = Object.values(responses).some(
    (c) => c !== Consensus.Indeterminate
  );
  if (!atLeastOneConsensus) {
    return (
      <div className={styles.userSubmissionRequirements}>
        <p className={styles.userSubmissionLabel}>
          User-Submitted Class Requirements
        </p>
        <p className={styles.userSubmissionDescription}>
          No user-submitted information is available for this course yet.
        </p>
        <Link
          to="ratings?feedbackModal=true"
          className={styles.suggestEdit}
          onClick={handleFeedbackClick}
        >
          Taken this course? Help others by adding what you know →
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.userSubmissionRequirements}>
      <p className={styles.userSubmissionLabel}>
        User-Submitted Class Requirements
      </p>
      <div>
        {(() => {
          switch (responses.Attendance) {
            case Consensus.Yes:
              return (
                <>
                  <User className={styles.icon} />
                  <span className={styles.userSubmissionDescription}>
                    Attendance Required
                  </span>
                </>
              );
            case Consensus.No:
              return (
                <>
                  <UserXmark className={styles.icon} />
                  <span className={styles.userSubmissionDescription}>
                    Attendance Not Required
                  </span>
                </>
              );
          }
        })()}
      </div>
      <div>
        {(() => {
          switch (responses.Recording) {
            case Consensus.Yes:
              return (
                <>
                  <VideoCamera className={styles.icon} />
                  <span className={styles.userSubmissionDescription}>
                    Lectures Recorded
                  </span>
                </>
              );
            case Consensus.No:
              return (
                <>
                  <VideoCameraOff className={styles.icon} />
                  <span className={styles.userSubmissionDescription}>
                    Lectures Not Recorded
                  </span>
                </>
              );
          }
        })()}
      </div>
      <div>
        {(responses.Attendance === Consensus.Indeterminate || 
          responses.Attendance === Consensus.BellowThreshold) && (
          <>
            <QuestionMark className={styles.icon} style={{ color: "var(--label-color)" }} />
            <span className={styles.userSubmissionDescription} style={{ color: "var(--label-color)" }}>
              Unknown Attendance Requirement
            </span>
          </>
        )}
      </div>
      <div>
        {(responses.Recording === Consensus.Indeterminate || 
          responses.Recording === Consensus.BellowThreshold) && (
          <>
            <QuestionMark className={styles.icon} style={{ color: "var(--label-color)" }} />
            <span className={styles.userSubmissionDescription} style={{ color: "var(--label-color)" }}>
              Unknown Recording Status
            </span>
          </>
        )}
      </div>
      <Link
        to="ratings?feedbackModal=true"
        className={styles.suggestEdit}
        onClick={handleFeedbackClick}
      >
        Look inaccurate? Suggest an edit →{" "}
      </Link>
    </div>
  );
}

enum Consensus {
  Yes = "Yes",
  No = "No",
  BellowThreshold = "BellowThreshold",
  Indeterminate = "Indeterminate",
}

function getResponse(course: ICourse, metricName: MetricName): Consensus {
  if (METRIC_MAPPINGS[metricName].isRating) {
    throw new Error("getConsensus should not be called for rating metrics");
  }
  if (!course?.aggregatedRatings?.metrics) return Consensus.BellowThreshold;
  const metric = course.aggregatedRatings.metrics.find(
    (m) => m.metricName === metricName
  );
  if (!metric?.categories) return Consensus.BellowThreshold;

  const yesCount = metric.categories.find((c) => c.value === 1)?.count || 0;
  const noCount = metric.categories.find((c) => c.value === 0)?.count || 0;
  const total = yesCount + noCount;
  if (total < MINIMUM_RESPONSES_THRESHOLD) {
    return Consensus.BellowThreshold;
  }
  const yesPercentage = yesCount / total;
  const noPercentage = noCount / total;

  if (yesPercentage >= CONSENSUS_THRESHOLD) {
    return Consensus.Yes;
  } else if (noPercentage >= CONSENSUS_THRESHOLD) {
    return Consensus.No;
  } else {
    return Consensus.Indeterminate;
  }
}
