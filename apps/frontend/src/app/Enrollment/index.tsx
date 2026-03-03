import { useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import { Button, Select } from "@repo/theme";

import {
  CourseAnalyticsCardGrid,
  CourseAnalyticsField,
  CourseAnalyticsLayout,
  CourseAnalyticsSidebar,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useCourseAnalyticsIsDesktop } from "@/components/CourseAnalytics/CourseAnalyticsLayout/useCourseAnalyticsIsDesktop";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import { useReadCourseWithInstructor } from "@/hooks/api";
import type { ICourseWithInstructorClass } from "@/lib/api/courses";
import type { IEnrollment } from "@/lib/api/enrollment";
import { sortByTermDescending } from "@/lib/classes";
import { GetEnrollmentDocument, Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";

import styles from "./Enrollment.module.scss";
import EnrollmentGraph from "./EnrollmentGraph";

interface SemesterSelection {
  year: number;
  semester: Semester;
}

interface EnrollmentInput {
  year: number;
  semester: Semester;
  sessionId?: string;
  subject: string;
  courseNumber: string;
  sectionNumber: string;
}

interface EnrollmentDraft {
  id: string;
  course: CourseOption;
  metadata: string;
  input: EnrollmentInput;
}

export interface EnrollmentOutput extends EnrollmentDraft {
  color: string;
  data: IEnrollment;
}

interface EnrollmentSidebarProps {
  outputs: EnrollmentOutput[];
  onAddCourse: (draft: EnrollmentDraft) => Promise<boolean>;
  isAdding: boolean;
}

const BAR_CHART_COLORS = [
  "var(--blue-500)",
  "var(--blue-300)",
  "var(--blue-800)",
] as const;

const DEFAULT_INSTRUCTOR_LABEL = "All instructors";

const formatSemesterLabel = (semester: Semester, year: number) =>
  `${semester} ${year}`;

const toSemesterValue = (semester: Semester, year: number) =>
  JSON.stringify({ semester, year });

const parseSemesterValue = (value: string | null): SemesterSelection | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed.year === "number" &&
      typeof parsed.semester === "string"
    ) {
      return {
        year: parsed.year,
        semester: parsed.semester as Semester,
      };
    }
    return null;
  } catch {
    return null;
  }
};

const getInstructorNames = (courseClass: ICourseWithInstructorClass) => {
  const names = new Set<string>();

  courseClass.primarySection?.meetings.forEach((meeting) => {
    meeting.instructors.forEach((instructor) => {
      const name = `${instructor.givenName} ${instructor.familyName}`.trim();
      if (name) names.add(name);
    });
  });

  return Array.from(names).toSorted((a, b) => a.localeCompare(b));
};

const hasEnrollmentData = (courseClass: ICourseWithInstructorClass) =>
  Boolean(
    courseClass.primarySection?.number &&
      courseClass.primarySection?.enrollment?.latest
  );

const formatSectionNumber = (sectionNumber: string) =>
  sectionNumber.replace(/^0+(?=\d)/, "");

const getInstructorLabel = (courseClass: ICourseWithInstructorClass) => {
  const instructors = getInstructorNames(courseClass);
  if (instructors.length === 0) return DEFAULT_INSTRUCTOR_LABEL;
  if (instructors.length === 1) return instructors[0];
  return `${instructors[0]} +${instructors.length - 1}`;
};

const getOfferingId = (courseClass: ICourseWithInstructorClass) =>
  `${courseClass.sessionId ?? "1"}-${courseClass.number}`;

function EnrollmentSidebar({
  outputs,
  onAddCourse,
  isAdding,
}: EnrollmentSidebarProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [selectedSemesterValue, setSelectedSemesterValue] = useState<
    string | null
  >(null);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(
    null
  );

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    { skip: !selectedCourse }
  );

  const classesWithEnrollment = useMemo(
    () => courseData?.classes.filter(hasEnrollmentData) ?? [],
    [courseData]
  );

  const semesterOptions = useMemo(() => {
    if (classesWithEnrollment.length === 0) return [];

    return classesWithEnrollment
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
  }, [classesWithEnrollment]);

  const selectedSemester = useMemo(
    () => parseSemesterValue(selectedSemesterValue),
    [selectedSemesterValue]
  );

  const availableClasses = useMemo(() => {
    if (!selectedSemester) return [];

    return classesWithEnrollment
      .filter(
        (courseClass) =>
          courseClass.year === selectedSemester.year &&
          courseClass.semester === selectedSemester.semester
      )
      .toSorted((a, b) =>
        (a.primarySection?.number ?? a.number).localeCompare(
          b.primarySection?.number ?? b.number,
          undefined,
          { numeric: true }
        )
      );
  }, [classesWithEnrollment, selectedSemester]);

  const selectedClass = useMemo(
    () =>
      availableClasses.find(
        (courseClass) => getOfferingId(courseClass) === selectedOfferingId
      ) ?? (availableClasses.length === 1 ? availableClasses[0] : null),
    [availableClasses, selectedOfferingId]
  );

  useEffect(() => {
    if (!selectedSemester) {
      setSelectedOfferingId(null);
      return;
    }

    if (availableClasses.length === 1) {
      setSelectedOfferingId(getOfferingId(availableClasses[0]));
      return;
    }

    if (
      selectedOfferingId &&
      !availableClasses.some(
        (courseClass) => getOfferingId(courseClass) === selectedOfferingId
      )
    ) {
      setSelectedOfferingId(null);
    }
  }, [selectedSemester, availableClasses, selectedOfferingId]);

  const shouldShowOfferingCards =
    !!selectedSemester && availableClasses.length > 1;
  const offeringOptions = useMemo(
    () =>
      availableClasses.map((courseClass) => {
        const offeringId = getOfferingId(courseClass);
        const sectionNumber = formatSectionNumber(
          courseClass.primarySection?.number ?? courseClass.number
        );

        return {
          value: offeringId,
          label: `Section ${sectionNumber}\n${getInstructorLabel(courseClass)}`,
        };
      }),
    [availableClasses]
  );
  const shouldShowSemesterSelect = !!selectedCourse;
  const shouldShowAddButton = !!selectedCourse && !!selectedSemester;
  const hasSelectableClass = Boolean(selectedClass?.primarySection?.number);
  const isFull = outputs.length >= BAR_CHART_COLORS.length;
  const selectedSemesterLabel =
    semesterOptions.find((option) => option.value === selectedSemesterValue)
      ?.label ?? "All semesters";

  const selectedInstructorLabel = selectedClass
    ? getInstructorLabel(selectedClass)
    : DEFAULT_INSTRUCTOR_LABEL;
  const selectionId =
    selectedCourse && selectedClass && selectedClass.primarySection?.number
      ? `${selectedCourse.subject}-${selectedCourse.number}-${selectedClass.year}-${selectedClass.semester}-${selectedClass.sessionId ?? "1"}-${selectedClass.primarySection.number}`
      : null;
  const isAlreadyAdded =
    selectionId !== null && outputs.some((output) => output.id === selectionId);
  const canAddWithoutLoading =
    shouldShowAddButton && hasSelectableClass && !isFull && !isAlreadyAdded;
  const isAddButtonDisabled = !canAddWithoutLoading || isAdding;

  const handleAdd = async () => {
    if (
      !selectedCourse ||
      !selectedSemester ||
      !selectedClass ||
      !selectedClass.primarySection?.number ||
      !selectionId ||
      !canAddWithoutLoading ||
      isAdding
    ) {
      return;
    }

    const didAdd = await onAddCourse({
      id: selectionId,
      course: selectedCourse,
      metadata: `${selectedSemesterLabel} • ${selectedInstructorLabel}`,
      input: {
        year: selectedSemester.year,
        semester: selectedSemester.semester,
        sessionId: selectedClass.sessionId ?? undefined,
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
        sectionNumber: selectedClass.primarySection.number,
      },
    });

    if (!didAdd) return;

    setSelectedCourse(null);
    setSelectedSemesterValue(null);
    setSelectedOfferingId(null);
  };

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedSemesterValue(null);
    setSelectedOfferingId(null);
    addRecent(RecentType.Course, {
      subject: course.subject,
      number: course.number,
    });
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedSemesterValue(null);
    setSelectedOfferingId(null);
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
                  setSelectedOfferingId(null);
                }}
              />
            </CourseAnalyticsField>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {shouldShowOfferingCards && (
          <motion.div
            key="enrollment-offering-select"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <CourseAnalyticsField label="Section">
              <Select
                options={offeringOptions}
                searchable
                searchPlaceholder="Search sections..."
                placeholder="Select section"
                value={selectedOfferingId}
                onChange={(offeringId) => {
                  if (Array.isArray(offeringId)) return;
                  setSelectedOfferingId(offeringId);
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
                onClick={() => void handleAdd()}
                disabled={isAddButtonDisabled}
                variant={canAddWithoutLoading ? "primary" : "secondary"}
                className={styles.addButton}
              >
                {isAlreadyAdded
                  ? "Already added"
                  : isFull
                    ? "Remove a course first"
                    : availableClasses.length === 0
                      ? "No enrollment data"
                      : canAddWithoutLoading
                        ? "Add course"
                        : "Select section"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CourseAnalyticsSidebar>
  );
}

export default function Enrollment() {
  const client = useApolloClient();
  const isDesktop = useCourseAnalyticsIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [outputs, setOutputs] = useState<EnrollmentOutput[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isDesktop || outputs.length > 0) return;
    setDrawerOpen(true);
  }, [isDesktop, outputs.length]);

  const addOutput = async (draft: EnrollmentDraft): Promise<boolean> => {
    if (isAdding) return false;

    setIsAdding(true);

    try {
      const response = await client.query({
        query: GetEnrollmentDocument,
        variables: {
          year: draft.input.year,
          semester: draft.input.semester,
          sessionId: draft.input.sessionId,
          subject: draft.input.subject,
          courseNumber: draft.input.courseNumber,
          sectionNumber: draft.input.sectionNumber,
        },
        fetchPolicy: "no-cache",
      });

      const enrollmentData = response.data?.enrollment;
      if (!enrollmentData) return false;

      setOutputs((prev) => {
        if (prev.some((output) => output.id === draft.id)) return prev;

        const usedColors = new Set(prev.map((output) => output.color));
        const color =
          BAR_CHART_COLORS.find((candidate) => !usedColors.has(candidate)) ??
          BAR_CHART_COLORS[0];

        return [{ ...draft, color, data: enrollmentData }, ...prev];
      });

      return true;
    } catch {
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const remove = (index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
    setHoveredIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const shouldDimOthers = hoveredIndex !== null && outputs.length > 1;

  return (
    <CourseAnalyticsLayout
      isDesktop={isDesktop}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      sidebar={
        <EnrollmentSidebar
          outputs={outputs}
          onAddCourse={addOutput}
          isAdding={isAdding}
        />
      }
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
                      dimmed={shouldDimOthers && hoveredIndex !== index}
                      fluid
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClickDelete={() => remove(index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>
          )}
        </CourseAnalyticsCardGrid>
      </div>
      <EnrollmentGraph outputs={outputs} hoveredIndex={hoveredIndex} />
    </CourseAnalyticsLayout>
  );
}
