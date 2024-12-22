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

import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import { signIn } from "@/lib/api";
import { ICourse } from "@/lib/api";

import styles from "./Overview.module.scss";

enum Consensus {
  Yes = "Yes",
  No = "No",
  BellowThreshold = "BellowThreshold",
  Indeterminate = "Indeterminate",
}

export function UserSubmittedData() {
  const { data: user } = useReadUser();
  const { class: _class } = useClass();
  const handleFeedbackClick = (e: MouseEvent) => {
    if (!user) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      const redirectPath = `${currentPath}/ratings?feedbackModal=true`;
      signIn(redirectPath);
    }
  };
  const responses = {
    Recording: getResponse(_class.course, MetricName.Recording),
    Attendance: getResponse(_class.course, MetricName.Attendance),
  };
  const atLeastOneConsensus = Object.values(responses).some(
    (c) => c == Consensus.Yes || c == Consensus.No
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
        {responses.Attendance === Consensus.Yes && (
          <>
            <User className={styles.icon} />
            <span className={styles.userSubmissionDescription}>
              Attendance Required
            </span>
          </>
        )}
        {responses.Attendance === Consensus.No && (
          <>
            <UserXmark className={styles.icon} />
            <span className={styles.userSubmissionDescription}>
              Attendance Not Required
            </span>
          </>
        )}
        {(responses.Attendance === Consensus.Indeterminate ||
          responses.Attendance === Consensus.BellowThreshold) && (
          <>
            <QuestionMark
              className={styles.icon}
              style={{ color: "var(--label-color)" }}
            />
            <span
              className={styles.userSubmissionDescription}
              style={{ color: "var(--label-color)" }}
            >
              Unknown Attendance Requirement
            </span>
          </>
        )}
      </div>
      <div>
        {responses.Recording === Consensus.Yes && (
          <>
            <VideoCamera className={styles.icon} />
            <span className={styles.userSubmissionDescription}>
              Lectures Recorded
            </span>
          </>
        )}
        {responses.Recording === Consensus.No && (
          <>
            <VideoCameraOff className={styles.icon} />
            <span className={styles.userSubmissionDescription}>
              Lectures Not Recorded
            </span>
          </>
        )}
        {(responses.Recording === Consensus.Indeterminate ||
          responses.Recording === Consensus.BellowThreshold) && (
          <>
            <QuestionMark
              className={styles.icon}
              style={{ color: "var(--label-color)" }}
            />
            <span
              className={styles.userSubmissionDescription}
              style={{ color: "var(--label-color)" }}
            >
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
