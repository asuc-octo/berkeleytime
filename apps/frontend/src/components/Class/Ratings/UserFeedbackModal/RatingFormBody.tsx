import { Dispatch, SetStateAction } from "react";

import { REVIEWER_GRADE_OPTIONS } from "@repo/shared";
import { Flex, Select } from "@repo/theme";

import CourseSelect, { CourseOption } from "@/components/CourseSelect";
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
  selectedCourse: CourseOption | null;
  onCourseSelect?: (course: CourseOption | null) => void;
  userRatedClasses: Array<{ subject: string; courseNumber: string }>;
  disableRatedCourses: boolean;
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
  reviewerGrade: string | null;
  onReviewerGradeChange: (grade: string | null) => void;
}

export function RatingFormBody({
  selectedCourse,
  onCourseSelect,
  userRatedClasses,
  disableRatedCourses,
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
  reviewerGrade,
  onReviewerGradeChange,
}: RatingFormBodyProps) {
  return (
    <Flex direction="column">
      <div className={styles.mainSection}>
        <Flex direction="column" style={{ gap: "32px", padding: "24px 0" }}>
          {onCourseSelect && (
            <div className={styles.formGroup}>
              <div className={styles.questionPair}>
                <h3>
                  What course are you rating? <RequiredAsterisk />
                </h3>
                <div style={{ width: "100%" }}>
                  <CourseSelect
                    selectedCourse={selectedCourse}
                    onSelect={onCourseSelect}
                    onClear={() => onCourseSelect(null)}
                    ratedCourses={userRatedClasses}
                    disableRatedCourses={disableRatedCourses}
                  />
                </div>
              </div>
            </div>
          )}
          <ReviewContentForm
            reviewContent={reviewContent}
            setReviewContent={setReviewContent}
            showRequiredAsterisk={reviewTitle.trim().length > 0}
          />
          <ReviewTitleForm
            reviewTitle={reviewTitle}
            setReviewTitle={setReviewTitle}
            showRequiredAsterisk={reviewContent.trim().length > 0}
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

          <div className={styles.formGroup}>
            <div className={styles.questionPair}>
              <h3>Select grade received</h3>
              <div style={{ width: "100%" }}>
                <Select
                  options={REVIEWER_GRADE_OPTIONS.map((grade) => ({
                    value: grade,
                    label: grade,
                  }))}
                  disabled={!selectedCourse}
                  value={reviewerGrade}
                  onChange={(selectedOption) => {
                    if (Array.isArray(selectedOption))
                      onReviewerGradeChange(null);
                    else onReviewerGradeChange(selectedOption || null);
                  }}
                  placeholder="Select grade"
                  emptyMessage="No grades found."
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
