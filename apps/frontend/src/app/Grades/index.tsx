import { useEffect, useMemo, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { NavArrowRight } from "iconoir-react";

import { Button, PillSwitcher, Select } from "@repo/theme";

import {
  type CourseOutput,
  type Input,
  InputType,
  LIGHT_COLORS,
  getInputSearchParam,
  isInputEqual,
} from "@/components/CourseAnalytics/types";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import GradeBarGraph from "./GradeBarGraph";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { type IGradeDistribution } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  GetGradeDistributionDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";

import styles from "./Grades.module.scss";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 992);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(width > 992px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
};

type Output = CourseOutput<Input, IGradeDistribution>;

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

const getMetadata = (input: Input): string => {
  const instructor =
    input.type && input.familyName && input.givenName
      ? `${input.givenName} ${input.familyName}`
      : "All instructors";

  const semester =
    input.type && "year" in input && input.year && "semester" in input && input.semester
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

interface FilterPanelProps {
  outputs: Output[];
  setOutputs: React.Dispatch<React.SetStateAction<Output[]>>;
}

function FilterPanel({ outputs, setOutputs }: FilterPanelProps) {
  const client = useApolloClient();

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );

  const { data: course } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    {
      skip: !selectedCourse,
    }
  );

  const [selectedType, setSelectedType] = useState(
    DEFAULT_BY_OPTION.value
  );

  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null
  );

  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

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
    const semester =
      selectedType === InputType.Term ? selectedSemester : "all";

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

  const isFull = outputs.length >= 4;
  const isAlreadyAdded =
    currentInput !== null &&
    outputs.some((o) => isInputEqual(o.input, currentInput));

  const add = async () => {
    if (!currentInput || isFull || isAlreadyAdded) return;

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
        LIGHT_COLORS.find((color) => !usedColors.has(color)) || LIGHT_COLORS[0];

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

      setSelectedInstructor(null);
      setSelectedSemester(null);

      setLoading(false);
    } catch {
      setLoading(false);
      return;
    }
  };

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedInstructor(null);
    setSelectedSemester(null);
    addRecent(RecentType.Course, {
      subject: course.subject,
      number: course.number,
    });
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedInstructor(null);
    setSelectedSemester(null);
  };

  const hasSelection =
    selectedType === InputType.Instructor
      ? !!selectedInstructor
      : !!selectedSemester;
  const shouldShowAddButton = !!selectedCourse && hasSelection;
  const isAddButtonDisabled =
    !selectedCourse || !hasSelection || loading || isFull || isAlreadyAdded;

  return (
    <div className={styles.filterPanel}>
      <div className={styles.body}>
        <div className={styles.filtersHeader}>
          <p className={styles.filtersTitle}>Grades</p>
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Class</p>
          <CourseSelect
            onSelect={handleCourseSelect}
            onClear={handleCourseClear}
            selectedCourse={selectedCourse}
          />
        </div>
        <div className={styles.formControl}>
          <p className={styles.label}>Search by</p>
          <PillSwitcher
            items={TYPE_ITEMS}
            value={selectedType}
            onValueChange={(value) => {
              setSelectedInstructor(null);
              setSelectedSemester(null);
              setSelectedType(value as InputType);
            }}
            fullWidth
          />
        </div>
        {selectedType === InputType.Instructor && (
          <div className={styles.formControl}>
            <p className={styles.label}>Instructor</p>
            <Select
              options={instructorOptions}
              disabled={loading}
              searchable
              searchPlaceholder="Search instructors..."
              placeholder="Select instructor"
              value={selectedInstructor}
              onChange={(s) => {
                if (Array.isArray(s) || !s) return;
                setSelectedInstructor(s);
              }}
            />
          </div>
        )}
        {selectedType === InputType.Term && (
          <div className={styles.formControl}>
            <p className={styles.label}>Semester</p>
            <Select
              options={semesterOptions}
              disabled={loading}
              searchable
              searchPlaceholder="Search semesters..."
              placeholder="Select semester"
              value={selectedSemester}
              onChange={(s) => {
                if (Array.isArray(s)) return;
                setSelectedSemester(s);
              }}
            />
          </div>
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
                  variant={isAlreadyAdded || isFull ? "secondary" : "primary"}
                  className={styles.addButton}
                >
                  {isAlreadyAdded
                    ? "Already added"
                    : isFull
                      ? "Remove a course first"
                      : "Add course"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface OutputListProps {
  outputs: Output[];
  remove: (index: number) => void;
  mobile?: boolean;
}

function OutputList({ outputs, remove, mobile }: OutputListProps) {
  const cards = (
    <LayoutGroup>
      <AnimatePresence mode="popLayout">
        {outputs.map((output, index) => (
          <motion.div
            key={getInputSearchParam(output.input)}
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
              metadata={getMetadata(output.input)}
              gradeDistribution={output.data}
              onClickDelete={() => remove(index)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </LayoutGroup>
  );

  if (mobile) {
    if (outputs.length === 0) return null;
    return <div className={styles.mobileOutputList}>{cards}</div>;
  }

  return (
    <div className={styles.outputList}>
      <div className={styles.outputListHeader}>
        <p className={styles.outputListTitle}>Selected Courses</p>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.classList}>
          {outputs.length === 0 ? (
            <div className={styles.emptyState}>
              Add a course to get started
            </div>
          ) : (
            cards
          )}
        </div>
      </div>
    </div>
  );
}

export default function Grades() {
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [outputs, setOutputs] = useState<Output[]>([]);

  const remove = (index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>
          <FilterPanel outputs={outputs} setOutputs={setOutputs} />
          <div className={styles.divider} />
          <OutputList outputs={outputs} remove={remove} />
        </div>
      ) : (
        <>
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                className={styles.overlay}
                onClick={() => setDrawerOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <motion.div
            className={styles.drawer}
            animate={{ x: drawerOpen ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <FilterPanel outputs={outputs} setOutputs={setOutputs} />
          </motion.div>
        </>
      )}

      {!isDesktop && (
        <div
          className={styles.drawerTrigger}
          onClick={() => setDrawerOpen(true)}
        >
          {!drawerOpen && <NavArrowRight />}
        </div>
      )}

      <div className={styles.view}>
        {!isDesktop && (
          <OutputList outputs={outputs} remove={remove} mobile />
        )}
        <GradeBarGraph />
      </div>
    </div>
  );
}
