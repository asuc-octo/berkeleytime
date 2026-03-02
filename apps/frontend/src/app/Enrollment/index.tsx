import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Button, Select } from "@repo/theme";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import {
  CourseAnalyticsCardGrid,
  CourseAnalyticsField,
  CourseAnalyticsLayout,
  CourseAnalyticsSidebar,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useCourseAnalyticsIsDesktop } from "@/components/CourseAnalytics/CourseAnalyticsLayout/useCourseAnalyticsIsDesktop";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { sortByTermDescending } from "@/lib/classes";
import { RecentType, addRecent } from "@/lib/recent";

import styles from "./Enrollment.module.scss";

interface EnrollmentSidebarProps {
  onAddPreview: (preview: EnrollmentPreview) => void;
}

interface SemesterSelection {
  year: number;
  semester: string;
}

interface EnrollmentPreview {
  course: CourseOption;
  metadata: string;
}

const DEFAULT_INSTRUCTOR_LABEL = "All instructors";

const formatSemesterLabel = (semester: string, year: number) =>
  `${semester} ${year}`;

const toSemesterValue = (semester: string, year: number) =>
  JSON.stringify({ semester, year });

const parseSemesterValue = (value: string | null): SemesterSelection | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed.year === "number" && typeof parsed.semester === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

function EnrollmentSidebar({ onAddPreview }: EnrollmentSidebarProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const [selectedSemesterValue, setSelectedSemesterValue] = useState<
    string | null
  >(null);
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null
  );

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    { skip: !selectedCourse }
  );

  const semesterOptions = useMemo(() => {
    if (!courseData) return [];

    return courseData.classes
      .filter(
        (courseClass, index, classes) =>
          classes.findIndex(
            (candidate) =>
              candidate.year === courseClass.year &&
              candidate.semester === courseClass.semester
          ) === index
      )
      .toSorted(sortByTermDescending)
      .map((courseClass) => ({
        value: toSemesterValue(courseClass.semester, courseClass.year),
        label: formatSemesterLabel(courseClass.semester, courseClass.year),
      }));
  }, [courseData]);

  const selectedSemester = useMemo(
    () => parseSemesterValue(selectedSemesterValue),
    [selectedSemesterValue]
  );

  const instructorOptions = useMemo(() => {
    if (!courseData || !selectedSemester) return [];

    const instructors = new Set<string>();
    courseData.classes.forEach((courseClass) => {
      if (
        courseClass.year !== selectedSemester.year ||
        courseClass.semester !== selectedSemester.semester
      ) {
        return;
      }

      courseClass.primarySection?.meetings.forEach((meeting) => {
        meeting.instructors.forEach((instructor) => {
          const name = `${instructor.givenName} ${instructor.familyName}`.trim();
          if (name) instructors.add(name);
        });
      });
    });

    const options = Array.from(instructors).map((instructor) => ({
      value: instructor,
      label: instructor,
    }));

    if (options.length === 0) {
      return [{ value: "all", label: DEFAULT_INSTRUCTOR_LABEL }];
    }

    return options;
  }, [courseData, selectedSemester]);

  useEffect(() => {
    if (!selectedSemester) {
      setSelectedInstructor(null);
      return;
    }

    if (instructorOptions.length <= 1) {
      setSelectedInstructor(instructorOptions[0]?.value ?? "all");
      return;
    }

    if (!selectedInstructor) return;
    if (!instructorOptions.some((option) => option.value === selectedInstructor)) {
      setSelectedInstructor(null);
    }
  }, [selectedSemester, instructorOptions, selectedInstructor]);

  const shouldShowInstructorSelect =
    !!selectedSemester && instructorOptions.length > 1;
  const shouldShowSemesterSelect = !!selectedCourse;
  const shouldShowAddButton = !!selectedCourse && !!selectedSemester;
  const canAdd =
    shouldShowAddButton &&
    (!shouldShowInstructorSelect || Boolean(selectedInstructor));

  const selectedSemesterLabel =
    semesterOptions.find((option) => option.value === selectedSemesterValue)
      ?.label ?? "All semesters";

  const selectedInstructorLabel =
    instructorOptions.find((option) => option.value === selectedInstructor)?.label ??
    DEFAULT_INSTRUCTOR_LABEL;

  const handleAdd = () => {
    if (!selectedCourse || !selectedSemester) return;
    if (shouldShowInstructorSelect && !selectedInstructor) return;

    onAddPreview({
      course: selectedCourse,
      metadata: `${selectedSemesterLabel} • ${selectedInstructorLabel}`,
    });

    setSelectedCourse(null);
    setSelectedSemesterValue(null);
    setSelectedInstructor(null);
  };

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedSemesterValue(null);
    setSelectedInstructor(null);
    addRecent(RecentType.Course, {
      subject: course.subject,
      number: course.number,
    });
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedSemesterValue(null);
    setSelectedInstructor(null);
  };

  return (
    <CourseAnalyticsSidebar title="Enrollment">
      <CourseAnalyticsField label="Class">
        <CourseSelect
          selectedCourse={selectedCourse}
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
        />
      </CourseAnalyticsField>
      <AnimatePresence initial={false}>
        {shouldShowSemesterSelect && (
          <motion.div
            key="enrollment-semester-select"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <CourseAnalyticsField label="Semester">
              <Select
                options={semesterOptions}
                searchable
                searchPlaceholder="Search semesters..."
                placeholder="Select semester"
                value={selectedSemesterValue}
                onChange={(semester) => {
                  if (Array.isArray(semester)) return;
                  setSelectedSemesterValue(semester);
                  setSelectedInstructor(null);
                }}
              />
            </CourseAnalyticsField>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {shouldShowInstructorSelect && (
          <motion.div
            key="enrollment-instructor-select"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <CourseAnalyticsField label="Instructor">
              <Select
                options={instructorOptions}
                searchable
                searchPlaceholder="Search instructors..."
                placeholder="Select instructor"
                value={selectedInstructor}
                onChange={(instructor) => {
                  if (Array.isArray(instructor)) return;
                  setSelectedInstructor(instructor);
                }}
              />
            </CourseAnalyticsField>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.addButtonSlot}>
        <AnimatePresence initial={false}>
          {shouldShowAddButton && (
            <motion.div
              key="enrollment-add-course-button"
              className={styles.addButtonMotion}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <Button
                onClick={handleAdd}
                disabled={!canAdd}
                variant={canAdd ? "primary" : "secondary"}
                className={styles.addButton}
              >
                {canAdd ? "Add course" : "Select instructor"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CourseAnalyticsSidebar>
  );
}

export default function Enrollment() {
  const isDesktop = useCourseAnalyticsIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preview, setPreview] = useState<EnrollmentPreview | null>(null);

  useEffect(() => {
    if (isDesktop || preview) return;
    setDrawerOpen(true);
  }, [isDesktop, preview]);

  const graphMessage = preview
    ? "Enrollment graph coming soon."
    : "Add a class from the sidebar to view enrollment trends.";

  return (
    <CourseAnalyticsLayout
      isDesktop={isDesktop}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      sidebar={<EnrollmentSidebar onAddPreview={setPreview} />}
    >
      <div className={styles.outputList}>
        <CourseAnalyticsCardGrid>
          {preview ? (
            <div className={styles.outputCardItem}>
              <CourseSelectionCard
                color="var(--blue-500)"
                subject={preview.course.subject}
                number={preview.course.number}
                metadata={preview.metadata}
                loadGradeDistribution={false}
                fluid
              />
            </div>
          ) : (
            <div className={styles.emptyCard} />
          )}
        </CourseAnalyticsCardGrid>
      </div>

      <div className={styles.graphPlaceholder}>
        <div className={styles.graphMessage}>{graphMessage}</div>
      </div>
    </CourseAnalyticsLayout>
  );
}
