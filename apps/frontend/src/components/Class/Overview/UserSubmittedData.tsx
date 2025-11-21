import { MouseEvent as ReactMouseEvent } from "react";

import {
  QuestionMark,
  User,
  UserXmark,
  VideoCamera,
  VideoCameraOff,
} from "iconoir-react";
import { Link } from "react-router-dom";

import {
  CONSENSUS_THRESHOLD,
  METRIC_MAPPINGS,
  MINIMUM_RESPONSES_THRESHOLD,
  MetricName,
} from "@repo/shared";
import { Flex } from "@repo/theme";

import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { IClassCourse, signIn } from "@/lib/api";

import overviewStyles from "./Overview.module.scss";
import styles from "./UserSubmittedData.module.scss";

enum Consensus {
  Yes = "Yes",
  No = "No",
  BellowThreshold = "BellowThreshold",
  Indeterminate = "Indeterminate",
}

export function UserSubmittedData() {
  const { user } = useUser();
  const { class: _class } = useClass();
  const handleFeedbackClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      const redirectPath = `${currentPath}/ratings?feedbackModal=true`;
      signIn(redirectPath);
    }
  };
  const responses: Record<
    MetricName.Attendance | MetricName.Recording,
    Consensus
  > = {
    [MetricName.Recording]: getResponse(_class.course, MetricName.Recording),
    [MetricName.Attendance]: getResponse(_class.course, MetricName.Attendance),
  };
  const atLeastOneConsensus = Object.values(responses).some(
    (c) => c == Consensus.Yes || c == Consensus.No
  );

  const METRIC_DISPLAY_CONFIG = [
    {
      metric: MetricName.Attendance as const,
      yes: { icon: User, text: "Attendance Required" },
      no: { icon: UserXmark, text: "Attendance Not Required" },
      unknown: { icon: QuestionMark, text: "Unknown Attendance Requirement" },
    },
    {
      metric: MetricName.Recording as const,
      yes: { icon: VideoCamera, text: "Lectures Recorded" },
      no: { icon: VideoCameraOff, text: "Lectures Not Recorded" },
      unknown: { icon: QuestionMark, text: "Unknown Recording Status" },
    },
  ];

  return (
    <Flex direction="column" gap="2">
      <p className={overviewStyles.label}>User-Submitted Class Requirements</p>
      {!atLeastOneConsensus ? (
        <>
          <p className={overviewStyles.description}>
            More user-submitted information is required to show this content.
          </p>
          <Link
            to="ratings?feedbackModal=true"
            className={styles.suggestEdit}
            onClick={handleFeedbackClick}
          >
            Taken this course? Help others by adding what you know →
          </Link>
        </>
      ) : (
        <div className={styles.userSubmissionRequirements}>
          <div className={styles.dataGroup}>
            {METRIC_DISPLAY_CONFIG.map(({ metric, yes, no, unknown }) => {
              const consensus = responses[metric];
              const isUnknown =
                consensus === Consensus.Indeterminate ||
                consensus === Consensus.BellowThreshold;
              const config =
                consensus === Consensus.Yes
                  ? yes
                  : consensus === Consensus.No
                    ? no
                    : unknown;
              const Icon = config.icon;

              return (
                <div key={metric}>
                  <Icon
                    className={styles.icon}
                    style={
                      isUnknown ? { color: "var(--label-color)" } : undefined
                    }
                  />
                  <span
                    className={overviewStyles.description}
                    style={
                      isUnknown ? { color: "var(--label-color)" } : undefined
                    }
                  >
                    {config.text}
                  </span>
                </div>
              );
            })}
          </div>
          <div>
            <Link
              to="ratings?feedbackModal=true"
              className={styles.suggestEdit}
              onClick={handleFeedbackClick}
            >
              Look inaccurate? Suggest an edit →{" "}
            </Link>
          </div>
        </div>
      )}
    </Flex>
  );
}

function getResponse(course: IClassCourse, metricName: MetricName): Consensus {
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
