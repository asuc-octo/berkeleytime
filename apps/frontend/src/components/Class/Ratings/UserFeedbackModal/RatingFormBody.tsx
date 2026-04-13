import { Dispatch, SetStateAction } from "react";

import { Flex, Select } from "@repo/theme";

import { Semester } from "@/lib/generated/graphql";

import { MetricData } from "../metricsUtil";
import {
  AttendanceForm,
  RatingsForm,
  ReviewContentForm,
  ReviewTitleForm,
} from "./FeedbackForm";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./UserFeedbackModal.module.scss";

const RequiredAsterisk = () => <span style={{ color: "red" }}>*</span>;

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
}

interface QuestionNumbers {
  semesterQuestionNumber: number;
  ratingsStartNumber: number;
  attendanceStartNumber: number;
}

interface RatingFormBodyProps {
  selectedCourse: { subject: string; number: string } | null;
  selectedTerm: string | null;
  onTermSelect: (term: string | null) => void;
  termOptions: Term[];
  termOptionsLoading?: boolean;
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
  questionNumbers: QuestionNumbers;
  reviewTitle: string;
  setReviewTitle: (value: string) => void;
  reviewContent: string;
  setReviewContent: (value: string) => void;
}

export function RatingFormBody({
  selectedCourse,
  selectedTerm,
  onTermSelect,
  termOptions,
  termOptionsLoading = false,
  metricData,
  setMetricData,
  questionNumbers,
  reviewTitle,
  setReviewTitle,
  reviewContent,
  setReviewContent,
}: RatingFormBodyProps) {
  return (
    <Flex direction="column">
      <div className={styles.mainSection}>
        <Flex direction="column" style={{ gap: "32px", padding: "24px 0" }}>
          <ReviewContentForm
            reviewContent={reviewContent}
            setReviewContent={setReviewContent}
            showRequiredAsterisk={reviewTitle.trim().length > 0}
          />
          <div className={styles.formGroup}>
            <div className={styles.questionPair}>
              <h3>
                What semester did you take this course? <RequiredAsterisk />
              </h3>
              <div style={{ width: "100%" }}>
                <Select
                  options={termOptions.map((term) => ({
                    value: term.value,
                    label: term.label,
                  }))}
                  disabled={!selectedCourse || termOptionsLoading}
                  loading={termOptionsLoading}
                  value={selectedTerm}
                  onChange={(selectedOption) => {
                    if (Array.isArray(selectedOption)) onTermSelect(null);
                    else onTermSelect(selectedOption || null);
                  }}
                  placeholder="Select semester"
                  emptyMessage="No semesters found."
                  clearable={true}
                  searchable={true}
                />
              </div>
            </div>
          </div>

          <RatingsForm
            metricData={metricData}
            setMetricData={setMetricData}
            startQuestionNumber={questionNumbers.ratingsStartNumber}
          />
          <ReviewTitleForm
            reviewTitle={reviewTitle}
            setReviewTitle={setReviewTitle}
            showRequiredAsterisk={reviewContent.trim().length > 0}
          />
        </Flex>
      </div>

      <AttendanceForm
        metricData={metricData}
        setMetricData={setMetricData}
        startQuestionNumber={questionNumbers.attendanceStartNumber}
      />
    </Flex>
  );
}
