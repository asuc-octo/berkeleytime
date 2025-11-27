import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";

import { Box, Select, SelectHandle } from "@repo/theme";
import { Button, Flex } from "@repo/theme";

import {
  type CourseOutput,
  type Input,
  InputType,
  LIGHT_COLORS,
  getInputSearchParam,
  isInputEqual,
} from "@/components/CourseAnalytics/types";
import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { type IGradeDistribution } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  GetGradeDistributionDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";

import styles from "./CourseInput.module.scss";

type Output = CourseOutput<Input, IGradeDistribution>;

interface CourseInputProps {
  outputs: Output[];
  setOutputs: Dispatch<SetStateAction<Output[]>>;
}

const FILTER_TABS = {
  Instructor: "instructor",
  Semester: "semester",
} as const;

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

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const filterSelectRef = useRef<SelectHandle>(null);

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

  const [activeTab, setActiveTab] = useState<string>(FILTER_TABS.Instructor);
  const [selectedValue, setSelectedValue] = useState<string | null>("all");

  // Build instructor options from course data
  const instructorOptions = useMemo(() => {
    const allOption = { value: "all", label: "All Results" };
    if (!course) return [allOption];

    const instructorMap = new Map<string, string>();
    course.classes.forEach((c) => {
      if (!c.gradeDistribution.average) return;
      if (!c.primarySection) return;
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          const key = `${i.familyName}, ${i.givenName}`;
          const displayName = `${i.givenName} ${i.familyName}`;
          instructorMap.set(key, displayName);
        });
      });
    });

    const instructorOpts = Array.from(instructorMap.entries()).map(
      ([value, label]) => ({ value, label })
    );

    return [allOption, ...instructorOpts];
  }, [course]);

  // Build semester options from course data
  const semesterOptions = useMemo(() => {
    const allOption = { value: "all", label: "All Results" };
    if (!course) return [allOption];

    const seen = new Set<string>();
    const uniqueClasses = course.classes
      .filter(({ sessionId }) => !!sessionId)
      .filter(({ gradeDistribution }) => gradeDistribution.average)
      .filter(({ year, semester }) => {
        const key = `${year}-${semester}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .toSorted(sortByTermDescending);

    const semesterOpts = uniqueClasses.map((t) => ({
      value: buildSemesterValue(t.year, t.semester, t.sessionId),
      label: `${t.semester} ${t.year}`,
    }));

    return [allOption, ...semesterOpts];
  }, [course]);

  const add = async () => {
    if (!selectedCourse || !selectedValue) return;

    addRecent(RecentType.Course, {
      subject: selectedCourse.subject,
      number: selectedCourse.number,
    });

    let input: Input;

    // "All Results" in either tab = course-level aggregate
    if (selectedValue === "all") {
      input = {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
      };
    }
    // By Instructor tab - selected specific instructor
    else if (activeTab === FILTER_TABS.Instructor) {
      const [familyName, givenName] = selectedValue.split(", ");
      input = {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
        type: InputType.Instructor,
        familyName,
        givenName,
      };
    }
    // By Semester tab - selected specific semester
    else {
      const parsedTerm = parseSemesterValue(selectedValue);
      if (!parsedTerm) return;
      const { semester, year, sessionId } = parsedTerm;

      input = {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
        type: InputType.Term,
        year,
        semester: semester as Semester,
        sessionId,
      };
    }

    // Do not fetch duplicates
    const existingOutput = outputs.find((output) =>
      isInputEqual(output.input, input)
    );

    if (existingOutput) return;

    setLoading(true);

    try {
      const response = await client.query({
        query: GetGradeDistributionDocument,
        variables: input,
      });

      if (!response.data) {
        throw response.error;
      }

      // first available color
      const usedColors = new Set(outputs.map((output) => output.color));
      const availableColor =
        LIGHT_COLORS.find((color) => !usedColors.has(color)) || LIGHT_COLORS[0];

      const output: Output = {
        hidden: false,
        active: false,
        color: availableColor,
        data: response.data!.grade,
        input,
      };

      setOutputs((prev) =>
        [...prev, output].map((o) => ({
          ...o,
          active: false,
        }))
      );

      searchParams.append("input", getInputSearchParam(input));
      setSearchParams(searchParams);

      // Reset selectors back to defaults after adding a course
      setSelectedCourse(null);
      setSelectedValue(null);
      setActiveTab(FILTER_TABS.Instructor);

      setLoading(false);
    } catch {
      setLoading(false);
      return;
    }
  };

  const disabled = useMemo(
    () => loading || outputs.length === 4,
    [loading, outputs]
  );

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    setSelectedValue("all");
    filterSelectRef.current?.focus();
    filterSelectRef.current?.openMenu();
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedValue(null);
  };

  return (
    <Flex direction="row" gap="3">
      <Box style={{ width: "350px" }}>
        <CourseSelect
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
          selectedCourse={selectedCourse}
        />
      </Box>
      <Box style={{ width: "350px" }}>
        <Select
          ref={filterSelectRef}
          variant="foreground"
          searchable
          placeholder={!selectedCourse ? "Select a class first" : undefined}
          searchPlaceholder={
            activeTab === FILTER_TABS.Instructor
              ? "Search instructors"
              : "Search semesters"
          }
          emptyMessage={
            activeTab === FILTER_TABS.Instructor
              ? "No instructors found"
              : "No semesters found"
          }
          disabled={disabled || !selectedCourse}
          tabs={[
            {
              value: FILTER_TABS.Instructor,
              label: "By Instructor",
              options: instructorOptions,
            },
            {
              value: FILTER_TABS.Semester,
              label: "By Semester",
              options: semesterOptions,
            },
          ]}
          value={!selectedCourse ? null : selectedValue}
          defaultTab={FILTER_TABS.Instructor}
          onTabChange={(tabValue) => {
            setActiveTab(tabValue);
            setSelectedValue("all");
          }}
          onChange={(newValue) => {
            if (Array.isArray(newValue) || !newValue) return;
            setSelectedValue(newValue);
          }}
        />
      </Box>
      <Button
        onClick={() => add()}
        disabled={disabled || !selectedCourse || !selectedValue}
        className={styles.addButton}
      >
        Add course
      </Button>
    </Flex>
  );
}
