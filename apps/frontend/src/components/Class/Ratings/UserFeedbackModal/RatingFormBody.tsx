import { Dispatch, SetStateAction } from "react";

import { Flex, Select } from "@repo/theme";

import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import { Semester } from "@/lib/generated/graphql";

import { MetricData } from "../metricsUtil";
import { AttendanceForm, RatingsForm, ReviewForm } from "./FeedbackForm";
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
  classQuestionNumber: number;
  semesterQuestionNumber: number;
  ratingsStartNumber: number;
  attendanceStartNumber: number;
}

interface RatingFormBodyProps {
  selectedCourse: CourseOption | null;
  onCourseSelect: (course: CourseOption | null) => void;
  onCourseClear: () => void;
  selectedTerm: string | null;
  onTermSelect: (term: string | null) => void;
  termOptions: Term[];
  termOptionsLoading?: boolean;
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
  userRatedClasses?: Array<{ subject: string; courseNumber: string }>;
  questionNumbers: QuestionNumbers;
  disableRatedCourses?: boolean;
  lockedCourse?: CourseOption | null;
  review: string;
  setReview: (value: string) => void;
}

export function RatingFormBody({
  selectedCourse,
  onCourseSelect,
  onCourseClear,
  selectedTerm,
  onTermSelect,
  termOptions,
  termOptionsLoading = false,
  metricData,
  setMetricData,
  userRatedClasses = [],
  questionNumbers,
  disableRatedCourses = false,
  lockedCourse = null,
  review,
  setReview,
}: RatingFormBodyProps) {
  return (
    <Flex direction="column">
      <div
        className={styles.mainSection}
      >
        <Flex direction="column" style={{ gap: "32px", padding: "24px 0" }}>
          <div className={styles.formGroup}>
            <div className={styles.questionPair}>
              <h3>
                Which class are you rating? <RequiredAsterisk />
              </h3>
              <div style={{ width: "100%" }}>
                <CourseSelect
                  selectedCourse={selectedCourse}
                  onSelect={(course) => {
                    onCourseSelect(course);
                  }}
                  onClear={onCourseClear}
                  minimal={true}
                  ratedCourses={userRatedClasses}
                  disableRatedCourses={disableRatedCourses}
                  lockedCourse={lockedCourse}
                />
              </div>
            </div>
          </div>

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
                  placeholder={
                    selectedCourse ? "Select semester" : "Select a class first"
                  }
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
          <ReviewForm review={review} setReview={setReview} />
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
