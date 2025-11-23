import { Dispatch, SetStateAction } from "react";

import { Flex, Select } from "@repo/theme";

import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import { Semester } from "@/lib/generated/graphql";

import { MetricData } from "../metricsUtil";
import { AttendanceForm, RatingsForm } from "./FeedbackForm";
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
  metricData: MetricData;
  setMetricData: Dispatch<SetStateAction<MetricData>>;
  userRatedClasses?: Array<{ subject: string; courseNumber: string }>;
  questionNumbers: QuestionNumbers;
  disableRatedCourses?: boolean;
  lockedCourse?: CourseOption | null;
}

export function RatingFormBody({
  selectedCourse,
  onCourseSelect,
  onCourseClear,
  selectedTerm,
  onTermSelect,
  termOptions,
  metricData,
  setMetricData,
  userRatedClasses = [],
  questionNumbers,
  disableRatedCourses = false,
  lockedCourse = null,
}: RatingFormBodyProps) {
  return (
    <Flex direction="column">
      <div className={styles.formGroup}>
        <div className={styles.questionPair}>
          <h3>
            {questionNumbers.classQuestionNumber}. Which class are you rating?{" "}
            <RequiredAsterisk />
          </h3>
          <div
            style={{
              width: 350,
              margin: "0 auto",
            }}
          >
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
            {questionNumbers.semesterQuestionNumber}. What semester did you take
            this course? <RequiredAsterisk />
          </h3>
          <div
            style={{
              width: 350,
              margin: "0 auto",
            }}
          >
            <Select
              options={termOptions.map((term) => ({
                value: term.value,
                label: term.label,
              }))}
              disabled={
                !selectedCourse ||
                (!!selectedCourse && termOptions.length === 0)
              }
              value={selectedTerm}
              onChange={(selectedOption) => {
                if (Array.isArray(selectedOption)) onTermSelect(null);
                else onTermSelect(selectedOption || null);
              }}
              placeholder="Select semester"
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
      <AttendanceForm
        metricData={metricData}
        setMetricData={setMetricData}
        startQuestionNumber={questionNumbers.attendanceStartNumber}
      />
    </Flex>
  );
}
