import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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
import useRafHoverIndex from "@/hooks/useRafHoverIndex";
import {
  EnrollmentUrlInput,
  getEnrollmentInputId,
  getEnrollmentInputSearchParam,
  isEnrollmentInputEqual,
  parseEnrollmentInputsFromUrl,
} from "@/lib/enrollmentUrl";
import type { ICourseWithInstructorClass } from "@/lib/api/courses";
import type { IEnrollment } from "@/lib/api/enrollment";
import { sortByTermDescending } from "@/lib/classes";
import { GetEnrollmentDocument, Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent, getPageUrl, savePageUrl } from "@/lib/recent";

import styles from "./Enrollment.module.scss";
import EnrollmentGraph from "./EnrollmentGraph";

interface SemesterSelection {
  year: number;
  semester: Semester;
}

type EnrollmentInput = EnrollmentUrlInput;

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

const getOutputMetadataFromInput = (input: EnrollmentInput) =>
  `${input.semester} ${input.year} • Section ${formatSectionNumber(input.sectionNumber)}`;

const loadOutputsFromInputs = async (
  client: ReturnType<typeof useApolloClient>,
  inputs: EnrollmentInput[]
): Promise<EnrollmentOutput[]> => {
  const dedupedInputs = inputs
    .filter(
      (input, index, allInputs) =>
        allInputs.findIndex((candidate) =>
          isEnrollmentInputEqual(candidate, input)
        ) === index
    )
    .slice(0, BAR_CHART_COLORS.length);

  const results = await Promise.all(
    dedupedInputs.map(async (input) => {
      try {
        const response = await client.query({
          query: GetEnrollmentDocument,
          variables: {
            year: input.year,
            semester: input.semester,
            sessionId: input.sessionId,
            subject: input.subject,
            courseNumber: input.courseNumber,
            sectionNumber: input.sectionNumber,
          },
          fetchPolicy: "no-cache",
        });

        if (!response.data?.enrollment) return null;

        return {
          input,
          data: response.data.enrollment,
        };
      } catch {
        return null;
      }
    })
  );

  return results
    .filter(
      (
        result
      ): result is {
        input: EnrollmentInput;
        data: IEnrollment;
      } => Boolean(result)
    )
    .map((result, index) => ({
      id: getEnrollmentInputId(result.input),
      course: {
        subject: result.input.subject,
        number: result.input.courseNumber,
        courseId:
          result.data.sectionId ??
          `${result.input.subject}-${result.input.courseNumber}`,
      },
      metadata: getOutputMetadataFromInput(result.input),
      input: result.input,
      color: BAR_CHART_COLORS[index] ?? BAR_CHART_COLORS[0],
      data: result.data,
    }));
};

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

  const { data: courseData, loading: courseLoading } = useReadCourseWithInstructor(
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
  const selectionInput: EnrollmentInput | null =
    selectedCourse && selectedClass && selectedClass.primarySection?.number
      ? {
          year: selectedClass.year,
          semester: selectedClass.semester,
          sessionId: selectedClass.sessionId ?? undefined,
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          sectionNumber: selectedClass.primarySection.number,
        }
      : null;
  const selectionId = selectionInput
    ? getEnrollmentInputId(selectionInput)
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
      !selectionInput ||
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
      input: selectionInput,
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
                loading={courseLoading}
                disabled={courseLoading}
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
                loading={courseLoading}
                disabled={courseLoading}
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

interface EnrollmentVisualizationProps {
  outputs: EnrollmentOutput[];
  remove: (index: number) => void;
}

function EnrollmentVisualization({
  outputs,
  remove,
}: EnrollmentVisualizationProps) {
  const { hoveredIndex, hoverCard, clearHover, shiftAfterRemoval } =
    useRafHoverIndex();
  const shouldDimOthers = hoveredIndex !== null && outputs.length > 1;

  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
      shiftAfterRemoval(index);
    },
    [remove, shiftAfterRemoval]
  );

  return (
    <>
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
                      onMouseEnter={() => hoverCard(index)}
                      onMouseLeave={clearHover}
                      onClickDelete={() => handleRemove(index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>
          )}
        </CourseAnalyticsCardGrid>
      </div>
      <EnrollmentGraph outputs={outputs} hoveredIndex={hoveredIndex} />
    </>
  );
}

export default function Enrollment() {
  const client = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const isDesktop = useCourseAnalyticsIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [outputs, setOutputs] = useState<EnrollmentOutput[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isHydratingFromUrl, setIsHydratingFromUrl] = useState(true);
  const skipNextUrlHydrationRef = useRef(false);
  const initialRestoreCompleteRef = useRef(false);
  const initialDrawerStateAppliedRef = useRef(false);

  useEffect(() => {
    if (searchParamsString.length > 0) return;

    const savedUrl = getPageUrl(RecentType.EnrollmentPage);
    if (!savedUrl) {
      initialRestoreCompleteRef.current = true;
      return;
    }

    navigate({ ...location, search: savedUrl }, { replace: true });
  }, []);

  useEffect(() => {
    if (!initialRestoreCompleteRef.current && searchParamsString.length > 0) {
      initialRestoreCompleteRef.current = true;
    }
  }, [searchParamsString]);

  useEffect(() => {
    if (!initialRestoreCompleteRef.current && location.search.length === 0) {
      return;
    }

    savePageUrl(RecentType.EnrollmentPage, location.search);
  }, [location.search]);

  useEffect(() => {
    if (skipNextUrlHydrationRef.current) {
      skipNextUrlHydrationRef.current = false;
      setIsHydratingFromUrl(false);
      return;
    }

    let cancelled = false;
    const parsedInputs = parseEnrollmentInputsFromUrl(
      new URLSearchParams(searchParamsString)
    ).slice(0, BAR_CHART_COLORS.length);

    if (parsedInputs.length === 0) {
      setOutputs((prev) => (prev.length === 0 ? prev : []));
      setIsHydratingFromUrl(false);
      return;
    }

    setIsHydratingFromUrl(true);

    void loadOutputsFromInputs(client, parsedInputs).then((hydratedOutputs) => {
      if (cancelled) return;
      setOutputs(hydratedOutputs);
      setIsHydratingFromUrl(false);
    });

    return () => {
      cancelled = true;
    };
  }, [client, searchParamsString]);

  useEffect(() => {
    if (isHydratingFromUrl) return;

    const nextParams = new URLSearchParams();
    outputs.forEach((output) => {
      nextParams.append("input", getEnrollmentInputSearchParam(output.input));
    });

    const nextSearch = nextParams.toString();
    const currentSearch = searchParamsString;
    if (nextSearch === currentSearch) return;

    skipNextUrlHydrationRef.current = true;
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch.length > 0 ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [
    isHydratingFromUrl,
    location.pathname,
    navigate,
    outputs,
    searchParamsString,
  ]);

  useEffect(() => {
    if (isDesktop) return;
    if (isHydratingFromUrl) return;
    if (initialDrawerStateAppliedRef.current) return;

    setDrawerOpen(outputs.length === 0);
    initialDrawerStateAppliedRef.current = true;
  }, [isDesktop, isHydratingFromUrl, outputs.length]);

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

  const remove = useCallback((index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
      <EnrollmentVisualization outputs={outputs} remove={remove} />
    </CourseAnalyticsLayout>
  );
}
