import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

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
  outputs: EnrollmentOutput[];
  onAddCourse: (draft: EnrollmentDraft) => void;
}

interface SemesterSelection {
  year: number;
  semester: string;
}

interface EnrollmentDraft {
  id: string;
  course: CourseOption;
  metadata: string;
}

interface EnrollmentOutput extends EnrollmentDraft {
  color: string;
}

const BAR_CHART_COLORS = [
  "var(--blue-500)",
  "var(--blue-300)",
  "var(--blue-800)",
] as const;

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

function EnrollmentSidebar({ outputs, onAddCourse }: EnrollmentSidebarProps) {
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
  const isFull = outputs.length >= BAR_CHART_COLORS.length;
  const selectedSemesterLabel =
    semesterOptions.find((option) => option.value === selectedSemesterValue)
      ?.label ?? "All semesters";

  const selectedInstructorLabel =
    instructorOptions.find((option) => option.value === selectedInstructor)?.label ??
    DEFAULT_INSTRUCTOR_LABEL;
  const selectionId =
    selectedCourse && selectedSemester
      ? `${selectedCourse.subject}-${selectedCourse.number}-${selectedSemesterLabel}-${selectedInstructorLabel}`
      : null;
  const isAlreadyAdded =
    selectionId !== null && outputs.some((output) => output.id === selectionId);
  const canAdd =
    shouldShowAddButton &&
    (!shouldShowInstructorSelect || Boolean(selectedInstructor)) &&
    !isFull &&
    !isAlreadyAdded;

  const handleAdd = () => {
    if (!selectedCourse || !selectedSemester || !selectionId || !canAdd) return;

    onAddCourse({
      id: selectionId,
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
                {isAlreadyAdded
                  ? "Already added"
                  : isFull
                    ? "Remove a course first"
                    : canAdd
                      ? "Add course"
                      : "Select instructor"}
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
  const [outputs, setOutputs] = useState<EnrollmentOutput[]>([]);

  useEffect(() => {
    if (isDesktop || outputs.length > 0) return;
    setDrawerOpen(true);
  }, [isDesktop, outputs.length]);

  const graphMessage = outputs.length > 0
    ? "Enrollment graph coming soon."
    : "Add a class from the sidebar to view enrollment trends.";

  const addOutput = (draft: EnrollmentDraft) => {
    setOutputs((prev) => {
      if (prev.some((output) => output.id === draft.id)) return prev;
      const usedColors = new Set(prev.map((output) => output.color));
      const color =
        BAR_CHART_COLORS.find((candidate) => !usedColors.has(candidate)) ??
        BAR_CHART_COLORS[0];

      return [{ ...draft, color }, ...prev];
    });
  };

  const remove = (index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <CourseAnalyticsLayout
      isDesktop={isDesktop}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      sidebar={<EnrollmentSidebar outputs={outputs} onAddCourse={addOutput} />}
    >
      <div className={styles.outputList}>
        <CourseAnalyticsCardGrid>
          {outputs.length === 0 ? (
            <div className={styles.emptyCard} />
          ) : (
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {outputs.map((output, index) => (
                  <motion.div
                    key={output.id}
                    className={styles.outputCardItem}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <CourseSelectionCard
                      color={output.color}
                      subject={output.course.subject}
                      number={output.course.number}
                      metadata={output.metadata}
                      fluid
                      onClickDelete={() => remove(index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>
          )}
        </CourseAnalyticsCardGrid>
      </div>

      <div className={styles.graphPlaceholder}>
        <div className={styles.graphMessage}>{graphMessage}</div>
      </div>
    </CourseAnalyticsLayout>
  );
}
