import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Button, PillSwitcher, Select } from "@repo/theme";

import {
  CourseAnalyticsCardGrid,
  CourseAnalyticsField,
  CourseAnalyticsLayout,
  CourseAnalyticsSidebar,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useCourseAnalyticsIsDesktop } from "@/components/CourseAnalytics/CourseAnalyticsLayout/useCourseAnalyticsIsDesktop";
import {
  type CourseOutput,
  type Input,
  InputType,
  getInputSearchParam,
  isInputEqual,
} from "@/components/CourseAnalytics/types";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import { useReadCourseWithInstructor } from "@/hooks/api";
import useEnterToAdd from "@/hooks/useEnterToAdd";
import useRafHoverIndex from "@/hooks/useRafHoverIndex";
import { type IGradeDistribution } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  GetGradeDistributionDocument,
  Semester,
} from "@/lib/generated/graphql";
import { LETTER_GRADES } from "@/lib/grades";
import { RecentType, addRecent, getPageUrl, savePageUrl } from "@/lib/recent";
import { parseInputsFromUrl } from "@/utils/url-course-parser";

import GradeBarGraph from "./GradeBarGraph";
import styles from "./Grades.module.scss";

// Ranked color palette for the bar chart (max 3 classes).
// When a slot opens up, the highest-priority unused color is assigned.
const BAR_CHART_COLORS = [
  "var(--blue-500)", // 1st pick — primary blue
  "var(--blue-300)", // 2nd pick — lighter
  "var(--blue-800)", // 3rd pick — darker
] as const;

type Output = CourseOutput<Input, IGradeDistribution>;

const loadOutputsFromInputs = async (
  client: ReturnType<typeof useApolloClient>,
  inputs: Input[]
): Promise<Output[]> => {
  const dedupedInputs = inputs
    .filter(
      (input, index, arr) =>
        arr.findIndex((candidate) => isInputEqual(candidate, input)) === index
    )
    .slice(0, BAR_CHART_COLORS.length);

  const results = await Promise.all(
    dedupedInputs.map(async (input) => {
      try {
        const response = await client.query({
          query: GetGradeDistributionDocument,
          variables: input,
        });

        if (!response.data?.grade) return null;

        return {
          data: response.data.grade,
          input,
        };
      } catch {
        return null;
      }
    })
  );

  return results
    .filter((result): result is { data: IGradeDistribution; input: Input } =>
      Boolean(result)
    )
    .map((result, index) => ({
      hidden: false,
      active: false,
      color: BAR_CHART_COLORS[index] ?? BAR_CHART_COLORS[0],
      data: result.data,
      input: result.input,
    }));
};

const DEFAULT_SELECTED_INSTRUCTOR = { value: "all", label: "All Instructors" };
const DEFAULT_SELECTED_SEMESTER = { value: "all", label: "All Semesters" };
const DEFAULT_BY_OPTION = {
  value: InputType.Instructor,
  label: "By Instructor",
};

const TYPE_ITEMS = [
  { value: InputType.Instructor, label: "Instructor" },
  { value: InputType.Term, label: "Semester" },
];
const LETTER_GRADE_SET = new Set<string>(LETTER_GRADES);

const getMetadata = (input: Input): string => {
  const instructor =
    input.type && input.familyName && input.givenName
      ? `${input.givenName} ${input.familyName}`
      : "All instructors";

  const semester =
    input.type &&
    "year" in input &&
    input.year &&
    "semester" in input &&
    input.semester
      ? `${input.semester} ${input.year}`
      : "All semesters";

  return `${semester} • ${instructor}`;
};

const buildSemesterValue = (
  year: number,
  semester: string,
  sessionId: string
) => JSON.stringify({ year, semester, sessionId });

const parseSemesterValue = (
  value: string | null
): {
  year: number;
  semester: string;
  sessionId: string;
} | null => {
  if (!value || value === "all") return null;

  try {
    const parsed = JSON.parse(value);
    if (
      typeof parsed.year === "number" &&
      typeof parsed.semester === "string" &&
      typeof parsed.sessionId === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const formatSemesterLabel = (semester: string, year: number) =>
  `${semester} ${year}`;

interface EditDraft {
  subject: string;
  courseNumber: string;
  courseId: string;
  type?: InputType;
  givenName?: string;
  familyName?: string;
  year?: number;
  semester?: string;
  sessionId?: string;
}

interface FilterPanelProps {
  outputs: Output[];
  setOutputs: React.Dispatch<React.SetStateAction<Output[]>>;
  editDraft: EditDraft | null;
  onEditDraftConsumed: () => void;
}

function FilterPanel({ outputs, setOutputs, editDraft, onEditDraftConsumed }: FilterPanelProps) {
  const client = useApolloClient();

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );

  const { data: course, loading: courseLoading } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    {
      skip: !selectedCourse,
    }
  );

  const [selectedType, setSelectedType] = useState(DEFAULT_BY_OPTION.value);

  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    "all"
  );

  const [selectedSemester, setSelectedSemester] = useState<string | null>(
    "all"
  );
  const [hasLetterGrades, setHasLetterGrades] = useState<boolean | null>(null);

  // Consume editDraft: populate sidebar state from the draft, then clear it
  useEffect(() => {
    if (!editDraft) return;

    setSelectedCourse({
      subject: editDraft.subject,
      number: editDraft.courseNumber,
      courseId: editDraft.courseId,
    });

    if (editDraft.type === InputType.Term && editDraft.year && editDraft.semester && editDraft.sessionId) {
      setSelectedType(InputType.Term);
      setSelectedSemester(buildSemesterValue(editDraft.year, editDraft.semester, editDraft.sessionId));
      setSelectedInstructor("all");
    } else if (editDraft.type === InputType.Instructor && editDraft.familyName && editDraft.givenName) {
      setSelectedType(InputType.Instructor);
      setSelectedInstructor(`${editDraft.familyName}, ${editDraft.givenName}`);
      setSelectedSemester("all");
    } else {
      setSelectedType(DEFAULT_BY_OPTION.value);
      setSelectedInstructor("all");
      setSelectedSemester("all");
    }

    onEditDraftConsumed();
  }, [editDraft, onEditDraftConsumed]);
  const [isCheckingLetterGrades, setIsCheckingLetterGrades] = useState(false);

  const instructorOptionsData = useMemo(() => {
    const list = [DEFAULT_SELECTED_INSTRUCTOR];
    if (!course) {
      return { options: list, autoSelectValue: null };
    }

    const selectedTerm = parseSemesterValue(selectedSemester);
    const instructorSet = new Set();

    course?.classes.forEach((c) => {
      if (!c.gradeDistribution.average) return;
      if (selectedType === InputType.Term) {
        if (!selectedTerm) return;
        if (
          c.year !== selectedTerm.year ||
          c.semester !== selectedTerm.semester ||
          c.sessionId !== selectedTerm.sessionId
        )
          return;
      }
      if (!c.primarySection) return;
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          instructorSet.add(`${i.familyName}, ${i.givenName}`);
        });
      });
    });

    const opts = [...instructorSet].map((v) => {
      const [family, given] = (v as string).split(", ");
      const label = given && family ? `${given} ${family}` : (v as string);
      return { value: v as string, label };
    });

    if (opts.length === 1 && selectedType === InputType.Term) {
      return { options: opts, autoSelectValue: opts[0].value };
    }

    return { options: [...list, ...opts], autoSelectValue: null };
  }, [course, selectedSemester, selectedType]);

  const instructorOptions = instructorOptionsData.options;

  useEffect(() => {
    if (!instructorOptionsData.autoSelectValue) return;
    if (selectedInstructor !== instructorOptionsData.autoSelectValue) {
      setSelectedInstructor(instructorOptionsData.autoSelectValue);
    }
  }, [instructorOptionsData.autoSelectValue, selectedInstructor]);

  const semesterOptionsData = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!course) {
      return { options: list, autoSelectValue: null };
    }

    const localSelectedInstructor = selectedInstructor;
    const filteredClasses =
      selectedType === InputType.Term
        ? course.classes
        : localSelectedInstructor === "all"
          ? []
          : course.classes.filter((c) =>
              c.primarySection?.meetings.find((m) =>
                m.instructors.find(
                  (i) =>
                    localSelectedInstructor ===
                    `${i.familyName}, ${i.givenName}`
                )
              )
            );

    const seen = new Set<string>();
    const uniqueClasses = filteredClasses
      .filter(({ sessionId }) => !!sessionId)
      .filter(({ gradeDistribution }) => gradeDistribution.average)
      .filter(({ year, semester }) => {
        const key = `${year}-${semester}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .toSorted(sortByTermDescending);

    const filteredOptions = uniqueClasses.map((t) => ({
      value: buildSemesterValue(t.year, t.semester, t.sessionId),
      label: formatSemesterLabel(t.semester, t.year),
    }));

    if (filteredOptions.length === 1) {
      return {
        options: filteredOptions,
        autoSelectValue: filteredOptions[0].value,
      };
    }

    return { options: [...list, ...filteredOptions], autoSelectValue: null };
  }, [course, selectedInstructor, selectedType]);

  const semesterOptions = semesterOptionsData.options;

  useEffect(() => {
    if (!semesterOptionsData.autoSelectValue) return;
    if (selectedSemester !== semesterOptionsData.autoSelectValue) {
      setSelectedSemester(semesterOptionsData.autoSelectValue);
    }
  }, [semesterOptionsData.autoSelectValue, selectedSemester]);

  const currentInput = useMemo((): Input | null => {
    if (!selectedCourse) return null;

    const instructor =
      selectedType === InputType.Instructor ? selectedInstructor : "all";
    const semester = selectedType === InputType.Term ? selectedSemester : "all";

    if (!instructor || !semester) return null;

    if (instructor === "all" && semester === "all") {
      return {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
      };
    }

    if (selectedType === InputType.Term) {
      const parsedTerm = parseSemesterValue(semester);
      if (!parsedTerm) return null;
      return {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
        type: InputType.Term,
        year: parsedTerm.year,
        semester: parsedTerm.semester as Semester,
        sessionId: parsedTerm.sessionId,
      };
    }

    const [familyName, givenName] = instructor.split(", ");
    return {
      subject: selectedCourse.subject,
      courseNumber: selectedCourse.number,
      type: InputType.Instructor,
      familyName,
      givenName,
    };
  }, [selectedCourse, selectedType, selectedInstructor, selectedSemester]);

  useEffect(() => {
    if (!currentInput) {
      setHasLetterGrades(null);
      setIsCheckingLetterGrades(false);
      return;
    }

    let cancelled = false;
    setHasLetterGrades(null);
    setIsCheckingLetterGrades(true);

    void client
      .query({
        query: GetGradeDistributionDocument,
        variables: currentInput,
      })
      .then((response) => {
        if (cancelled) return;

        const distribution = response.data?.grade?.distribution ?? [];
        const hasLetterDistribution = distribution.some(
          (grade) =>
            LETTER_GRADE_SET.has(grade.letter) && (grade.count ?? 0) > 0
        );

        setHasLetterGrades(hasLetterDistribution);
        setIsCheckingLetterGrades(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHasLetterGrades(null);
        setIsCheckingLetterGrades(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, currentInput]);

  const isFull = outputs.length >= BAR_CHART_COLORS.length;
  const isAlreadyAdded =
    currentInput !== null &&
    outputs.some((o) => isInputEqual(o.input, currentInput));
  const lacksLetterGrades = hasLetterGrades === false;
  const waitingForLetterGradeCheck =
    currentInput !== null &&
    (isCheckingLetterGrades || hasLetterGrades === null);

  const add = async () => {
    if (!currentInput || isFull || isAlreadyAdded || hasLetterGrades !== true)
      return;

    setLoading(true);

    try {
      const response = await client.query({
        query: GetGradeDistributionDocument,
        variables: currentInput,
      });

      if (!response.data) {
        throw response.error;
      }

      const usedColors = new Set(outputs.map((output) => output.color));
      const availableColor =
        BAR_CHART_COLORS.find((color) => !usedColors.has(color)) ??
        BAR_CHART_COLORS[0];

      const output: Output = {
        hidden: false,
        active: false,
        color: availableColor,
        data: response.data!.grade,
        input: currentInput,
      };

      setOutputs((prev) =>
        [output, ...prev].map((o) => ({
          ...o,
          active: false,
        }))
      );

      setSelectedCourse(null);
      setSelectedInstructor("all");
      setSelectedSemester("all");

      setLoading(false);
    } catch {
      setLoading(false);
      return;
    }
  };

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedInstructor("all");
    setSelectedSemester("all");
    addRecent(RecentType.Course, {
      subject: course.subject,
      number: course.number,
    });
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedInstructor("all");
    setSelectedSemester("all");
  };

  const hasSelection =
    selectedType === InputType.Instructor
      ? !!selectedInstructor
      : !!selectedSemester;
  const shouldShowSearchControls = !!selectedCourse;
  const shouldShowAddButton = !!selectedCourse && hasSelection;
  const isAddButtonDisabled =
    !selectedCourse ||
    !hasSelection ||
    loading ||
    isFull ||
    isAlreadyAdded ||
    hasLetterGrades !== true;

  useEnterToAdd(() => void add(), !isAddButtonDisabled);

  return (
    <CourseAnalyticsSidebar title="Grades">
      <CourseAnalyticsField label="Class">
        <CourseSelect
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
          selectedCourse={selectedCourse}
        />
      </CourseAnalyticsField>
      {shouldShowSearchControls && (
        <>
          <CourseAnalyticsField label="Search by">
            <PillSwitcher
              items={TYPE_ITEMS}
              value={selectedType}
              onValueChange={(value) => {
                setSelectedInstructor("all");
                setSelectedSemester("all");
                setSelectedType(value as InputType);
              }}
              fullWidth
            />
          </CourseAnalyticsField>
          {selectedType === InputType.Instructor && (
            <CourseAnalyticsField label="Instructor">
              <Select
                options={instructorOptions}
                loading={courseLoading}
                disabled={loading || courseLoading}
                searchable
                searchPlaceholder="Search instructors..."
                placeholder="Select instructor"
                value={selectedInstructor}
                onChange={(s) => {
                  if (Array.isArray(s) || !s) return;
                  setSelectedInstructor(s);
                }}
              />
            </CourseAnalyticsField>
          )}
          {selectedType === InputType.Term && (
            <CourseAnalyticsField label="Semester">
              <Select
                options={semesterOptions}
                loading={courseLoading}
                disabled={loading || courseLoading}
                searchable
                searchPlaceholder="Search semesters..."
                placeholder="Select semester"
                value={selectedSemester}
                onChange={(s) => {
                  if (Array.isArray(s)) return;
                  setSelectedSemester(s);
                }}
              />
            </CourseAnalyticsField>
          )}
        </>
      )}
      <div className={styles.addButtonSlot}>
        <AnimatePresence initial={false}>
          {shouldShowAddButton && (
            <motion.div
              key="add-course-button"
              className={styles.addButtonMotion}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <Button
                onClick={() => add()}
                disabled={isAddButtonDisabled}
                variant={
                  lacksLetterGrades ||
                  isAlreadyAdded ||
                  isFull ||
                  waitingForLetterGradeCheck
                    ? "secondary"
                    : "primary"
                }
                className={styles.addButton}
              >
                {lacksLetterGrades
                  ? "No letter grades available"
                  : isAlreadyAdded
                    ? "Already added"
                    : isFull
                      ? "Remove a course first"
                      : waitingForLetterGradeCheck
                        ? "Checking grades..."
                        : "Add course"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CourseAnalyticsSidebar>
  );
}

interface OutputListProps {
  outputs: Output[];
  remove: (index: number) => void;
  edit: (index: number) => void;
  hoveredIndex: number | null;
  onHoverCard: (index: number) => void;
  onClearHover: () => void;
}

function OutputList({
  outputs,
  remove,
  edit,
  hoveredIndex,
  onHoverCard,
  onClearHover,
}: OutputListProps) {
  const shouldDimOthers = hoveredIndex !== null && outputs.length > 1;

  return (
    <div className={styles.outputList}>
      <CourseAnalyticsCardGrid>
        {outputs.length === 0 ? (
          <div className={styles.emptyCard} />
        ) : (
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {outputs.map((output, index) => (
                <motion.div
                  key={getInputSearchParam(output.input)}
                  className={styles.outputCardItem}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CourseSelectionCard
                    color={output.color}
                    subject={output.input.subject}
                    number={output.input.courseNumber}
                    subtitle={getMetadata(output.input)}
                    dimmed={shouldDimOthers && hoveredIndex !== index}
                    fluid
                    onMouseEnter={() => onHoverCard(index)}
                    onMouseLeave={onClearHover}
                    onClickEdit={() => edit(index)}
                    onClickDelete={() => remove(index)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        )}
      </CourseAnalyticsCardGrid>
    </div>
  );
}

interface GradesVisualizationProps {
  outputs: Output[];
  remove: (index: number) => void;
  edit: (index: number) => void;
}

function GradesVisualization({ outputs, remove, edit }: GradesVisualizationProps) {
  const { hoveredIndex, hoverCard, clearHover, shiftAfterRemoval } =
    useRafHoverIndex();

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
      <OutputList
        outputs={outputs}
        remove={handleRemove}
        edit={handleEdit}
        hoveredIndex={hoveredIndex}
        onHoverCard={hoverCard}
        onClearHover={clearHover}
      />
      <GradeBarGraph outputs={outputs} hoveredIndex={hoveredIndex} />
    </>
  );
}

export default function Grades() {
  const client = useApolloClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const isDesktop = useCourseAnalyticsIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [isHydratingFromUrl, setIsHydratingFromUrl] = useState(true);
  const skipNextUrlHydrationRef = useRef(false);
  const initialRestoreCompleteRef = useRef(false);
  const initialDrawerStateAppliedRef = useRef(false);

  useEffect(() => {
    if (searchParamsString.length > 0) return;

    const savedUrl = getPageUrl(RecentType.GradesPage);
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

    savePageUrl(RecentType.GradesPage, location.search);
  }, [location.search]);

  useEffect(() => {
    if (skipNextUrlHydrationRef.current) {
      skipNextUrlHydrationRef.current = false;
      setIsHydratingFromUrl(false);
      return;
    }

    let cancelled = false;
    const parsedInputs = parseInputsFromUrl(
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
      nextParams.append("input", getInputSearchParam(output.input));
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

  const remove = useCallback((index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const edit = useCallback((index: number) => {
    setOutputs((prev) => {
      const output = prev[index];
      if (!output) return prev;

      const input = output.input;
      setEditDraft({
        subject: input.subject,
        courseNumber: input.courseNumber,
        courseId: `${input.subject}-${input.courseNumber}`,
        type: input.type,
        givenName: "givenName" in input ? input.givenName : undefined,
        familyName: "familyName" in input ? input.familyName : undefined,
        year: "year" in input ? input.year : undefined,
        semester: "semester" in input ? input.semester : undefined,
        sessionId: "sessionId" in input ? input.sessionId : undefined,
      });

      return prev.filter((_, i) => i !== index);
    });

    if (!isDesktop) {
      setDrawerOpen(true);
    }
  }, [isDesktop]);

  const clearEditDraft = useCallback(() => {
    setEditDraft(null);
  }, []);

  return (
    <CourseAnalyticsLayout
      isDesktop={isDesktop}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      sidebar={
        <FilterPanel
          outputs={outputs}
          setOutputs={setOutputs}
          editDraft={editDraft}
          onEditDraftConsumed={clearEditDraft}
        />
      }
    >
      <GradesVisualization outputs={outputs} remove={remove} edit={edit} />
    </CourseAnalyticsLayout>
  );
}
