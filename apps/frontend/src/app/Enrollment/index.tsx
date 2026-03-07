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
import { BAR_CHART_COLORS } from "@/components/CourseAnalytics/types";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import { useReadCourseWithInstructor } from "@/hooks/api";
import TargetedMessageBanner from "@/components/CourseAnalytics/TargetedMessageBanner";
import useEnterToAdd from "@/hooks/useEnterToAdd";
import useRafHoverIndex from "@/hooks/useRafHoverIndex";
import type { ICourseWithInstructorClass } from "@/lib/api/courses";
import type { IEnrollment } from "@/lib/api/enrollment";
import { sortByTermDescending } from "@/lib/classes";
import {
  EnrollmentUrlInput,
  getEnrollmentInputId,
  getEnrollmentInputSearchParam,
  isEnrollmentInputEqual,
  parseEnrollmentInputsFromUrl,
} from "@/lib/enrollmentUrl";
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
  input: EnrollmentInput;
}

export interface EnrollmentOutput extends EnrollmentDraft {
  subtitle: string;
  color: string;
  data: IEnrollment;
}

interface EnrollmentEditDraft {
  subject: string;
  courseNumber: string;
  courseId: string;
  year: number;
  semester: Semester;
  sectionNumber: string;
  sessionId?: string;
}

interface EnrollmentSidebarProps {
  outputs: EnrollmentOutput[];
  onAddCourse: (draft: EnrollmentDraft) => Promise<boolean>;
  isAdding: boolean;
  editDraft: EnrollmentEditDraft | null;
  onEditDraftConsumed: () => void;
}

const ENROLLMENT_ACTIVITY_THRESHOLD_PERCENT = 5;

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

const getValidEnrollmentDenominator = (history: IEnrollment["history"]) => {
  const maxSeen = Math.max(...history.map((entry) => entry.maxEnroll ?? 0), 0);
  if (maxSeen === 0) return 0;

  const lastValue = history[history.length - 1]?.maxEnroll ?? 0;
  return lastValue > 0 ? lastValue : maxSeen;
};

const hasValidEnrollmentActivity = (
  enrollment: IEnrollment | null | undefined
) => {
  const history = enrollment?.history ?? [];
  const denominator = getValidEnrollmentDenominator(history);
  if (denominator <= 0) return false;

  return history.some((entry) => {
    const enrolledCount = entry.enrolledCount ?? 0;
    const enrolledPercent = (enrolledCount / denominator) * 100;
    return enrolledPercent > ENROLLMENT_ACTIVITY_THRESHOLD_PERCENT;
  });
};

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
        if (!hasValidEnrollmentActivity(response.data.enrollment)) return null;

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
      subtitle: getOutputMetadataFromInput(result.input),
      input: result.input,
      color: BAR_CHART_COLORS[index] ?? BAR_CHART_COLORS[0],
      data: result.data,
    }));
};

function EnrollmentSidebar({
  outputs,
  onAddCourse,
  isAdding,
  editDraft,
  onEditDraftConsumed,
}: EnrollmentSidebarProps) {
  const client = useApolloClient();

  const displayedCourses = useMemo(
    () =>
      outputs.map((o) => ({
        subject: o.input.subject,
        courseNumber: o.input.courseNumber,
      })),
    [outputs]
  );

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [selectedSemesterValue, setSelectedSemesterValue] = useState<
    string | null
  >(null);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(
    null
  );
  const [hasValidEnrollment, setHasValidEnrollment] = useState<boolean | null>(
    null
  );
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  const { data: courseData, loading: courseLoading } =
    useReadCourseWithInstructor(
      selectedCourse?.subject ?? "",
      selectedCourse?.number ?? "",
      { skip: !selectedCourse }
    );

  // Consume editDraft: populate sidebar state from the draft, then clear it
  useEffect(() => {
    if (!editDraft) return;

    setSelectedCourse({
      subject: editDraft.subject,
      number: editDraft.courseNumber,
      courseId: editDraft.courseId,
    });

    const semesterValue = toSemesterValue(editDraft.semester, editDraft.year);
    setSelectedSemesterValue(semesterValue);
    setSelectedOfferingId(
      `${editDraft.sessionId ?? "1"}-${editDraft.sectionNumber}`
    );

    onEditDraftConsumed();
  }, [editDraft, onEditDraftConsumed]);

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
  const defaultSemesterValue = useMemo(() => {
    if (semesterOptions.length === 0) return null;

    const usedSemesterValues = new Set(
      outputs
        .filter(
          (o) =>
            o.input.subject === selectedCourse?.subject &&
            o.input.courseNumber === selectedCourse?.number
        )
        .map((o) => toSemesterValue(o.input.semester, o.input.year))
    );

    const preferNonSummer = (option: { value: string }) => {
      const parsed = parseSemesterValue(option.value);
      return parsed?.semester !== Semester.Summer;
    };

    // Try excluding already-selected semesters first
    const unusedOptions = semesterOptions.filter(
      (option) => !usedSemesterValues.has(option.value)
    );
    if (unusedOptions.length > 0) {
      const best = unusedOptions.find(preferNonSummer);
      return best?.value ?? unusedOptions[0].value;
    }

    // All semesters already used — fall back to normal logic
    const latestNonSummer = semesterOptions.find(preferNonSummer);
    return latestNonSummer?.value ?? semesterOptions[0]?.value ?? null;
  }, [semesterOptions, outputs, selectedCourse]);

  useEffect(() => {
    if (!selectedCourse) return;

    if (!defaultSemesterValue) {
      if (selectedSemesterValue !== null) {
        setSelectedSemesterValue(null);
      }
      return;
    }

    const hasValidSelectedSemester =
      selectedSemesterValue !== null &&
      semesterOptions.some((option) => option.value === selectedSemesterValue);

    if (!hasValidSelectedSemester) {
      setSelectedSemesterValue(defaultSemesterValue);
    }
  }, [
    defaultSemesterValue,
    selectedCourse,
    selectedSemesterValue,
    semesterOptions,
  ]);

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
  const selectionInput = useMemo((): EnrollmentInput | null => {
    if (
      !selectedCourse ||
      !selectedClass ||
      !selectedClass.primarySection?.number
    )
      return null;

    return {
      year: selectedClass.year,
      semester: selectedClass.semester,
      sessionId: selectedClass.sessionId ?? undefined,
      subject: selectedCourse.subject,
      courseNumber: selectedCourse.number,
      sectionNumber: selectedClass.primarySection.number,
    };
  }, [selectedClass, selectedCourse]);
  const selectionId = useMemo(
    () => (selectionInput ? getEnrollmentInputId(selectionInput) : null),
    [selectionInput]
  );

  useEffect(() => {
    if (!selectionInput) {
      setHasValidEnrollment(null);
      setIsCheckingEnrollment(false);
      return;
    }

    let cancelled = false;
    setHasValidEnrollment(null);
    setIsCheckingEnrollment(true);

    void client
      .query({
        query: GetEnrollmentDocument,
        variables: {
          year: selectionInput.year,
          semester: selectionInput.semester,
          sessionId: selectionInput.sessionId,
          subject: selectionInput.subject,
          courseNumber: selectionInput.courseNumber,
          sectionNumber: selectionInput.sectionNumber,
        },
        fetchPolicy: "no-cache",
      })
      .then((response) => {
        if (cancelled) return;
        setHasValidEnrollment(
          hasValidEnrollmentActivity(response.data?.enrollment)
        );
        setIsCheckingEnrollment(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHasValidEnrollment(null);
        setIsCheckingEnrollment(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, selectionInput]);

  const isAlreadyAdded =
    selectionId !== null && outputs.some((output) => output.id === selectionId);
  const lacksEnrollmentActivity = hasValidEnrollment === false;
  const waitingForEnrollmentCheck =
    selectionInput !== null &&
    (isCheckingEnrollment || hasValidEnrollment === null);
  const canAddWithoutLoading =
    shouldShowAddButton &&
    hasSelectableClass &&
    !isFull &&
    !isAlreadyAdded &&
    hasValidEnrollment === true;
  const isAddButtonDisabled = !canAddWithoutLoading || isAdding;

  const handleAdd = async () => {
    if (
      !selectedCourse ||
      !selectedSemester ||
      !selectedClass ||
      !selectedClass.primarySection?.number ||
      !selectionInput ||
      !selectionId ||
      hasValidEnrollment !== true ||
      !canAddWithoutLoading ||
      isAdding
    ) {
      return;
    }

    const didAdd = await onAddCourse({
      id: selectionId,
      course: selectedCourse,
      input: selectionInput,
    });

    if (!didAdd) return;

    setSelectedCourse(null);
    setSelectedSemesterValue(null);
    setSelectedOfferingId(null);
  };

  useEnterToAdd(() => void handleAdd(), canAddWithoutLoading && !isAdding);

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
    <CourseAnalyticsSidebar
      title="Enrollment"
      footer={
        displayedCourses.length > 0 ? (
          <TargetedMessageBanner courses={displayedCourses} />
        ) : undefined
      }
    >
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
                      : !hasSelectableClass
                        ? "Select section"
                        : lacksEnrollmentActivity
                          ? "No enrollment activity"
                          : waitingForEnrollmentCheck
                            ? "Checking enrollment..."
                            : "Add course"}
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
  edit: (index: number) => void;
}

function EnrollmentVisualization({
  outputs,
  remove,
  edit,
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

  const handleEdit = useCallback(
    (index: number) => {
      edit(index);
      shiftAfterRemoval(index);
    },
    [edit, shiftAfterRemoval]
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
                      subtitle={output.subtitle}
                      year={output.input.year}
                      semester={output.input.semester}
                      sectionNumber={output.input.sectionNumber}
                      sessionId={output.input.sessionId}
                      dimmed={shouldDimOthers && hoveredIndex !== index}
                      fluid
                      onMouseEnter={() => hoverCard(index)}
                      onMouseLeave={clearHover}
                      onClickEdit={() => handleEdit(index)}
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
  const [editDraft, setEditDraft] = useState<EnrollmentEditDraft | null>(null);
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
      if (!hasValidEnrollmentActivity(enrollmentData)) return false;

      setOutputs((prev) => {
        if (prev.some((output) => output.id === draft.id)) return prev;

        const usedColors = new Set(prev.map((output) => output.color));
        const color =
          BAR_CHART_COLORS.find((candidate) => !usedColors.has(candidate)) ??
          BAR_CHART_COLORS[0];

        return [
          {
            ...draft,
            subtitle: getOutputMetadataFromInput(draft.input),
            color,
            data: enrollmentData,
          },
          ...prev,
        ];
      });

      if (!isDesktop) {
        setDrawerOpen(false);
      }

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

  const edit = useCallback(
    (index: number) => {
      setOutputs((prev) => {
        const output = prev[index];
        if (!output) return prev;

        setEditDraft({
          subject: output.input.subject,
          courseNumber: output.input.courseNumber,
          courseId:
            output.course.courseId ??
            `${output.input.subject}-${output.input.courseNumber}`,
          year: output.input.year,
          semester: output.input.semester,
          sectionNumber: output.input.sectionNumber,
          sessionId: output.input.sessionId,
        });

        return prev.filter((_, i) => i !== index);
      });

      if (!isDesktop) {
        setDrawerOpen(true);
      }
    },
    [isDesktop]
  );

  const clearEditDraft = useCallback(() => {
    setEditDraft(null);
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
          editDraft={editDraft}
          onEditDraftConsumed={clearEditDraft}
        />
      }
    >
      <EnrollmentVisualization outputs={outputs} remove={remove} edit={edit} />
    </CourseAnalyticsLayout>
  );
}
