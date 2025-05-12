import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { useSearchParams } from "react-router-dom";

import { Box, Select, SelectHandle } from "@repo/theme";
import { Button, Flex } from "@repo/theme";

import CourseSearch from "@/components/CourseSearch";
import { useReadCourseWithInstructor } from "@/hooks/api";
import {
  ICourse,
  READ_GRADE_DISTRIBUTION,
  ReadGradeDistributionResponse,
  Semester,
} from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import { RecentType, addRecent } from "@/lib/recent";

import {
  Input,
  InputType,
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
  isInputEqual,
} from "../../types";
import styles from "./CourseInput.module.scss";

interface CourseInputProps {
  outputs: Output[];
  setOutputs: Dispatch<SetStateAction<Output[]>>;
}

const DEFAULT_SELECTED_INSTRUCTOR = { value: "all", label: "All Instructors" };
const DEFAULT_SELECTED_SEMESTER = { value: "all", label: "All Semesters" };
const DEFAULT_BY_OPTION = {
  value: InputType.Instructor,
  label: "By Instructor",
};

const TYPE_OPTIONS = [
  { value: InputType.Instructor, label: "By Instructor" },
  { value: InputType.Term, label: "By Semester" },
];

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const semesterSelectRef = useRef<SelectHandle>(null);
  const instructorSelectRef = useRef<SelectHandle>(null);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  const { data: course } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? ""
  );

  const [selectedType, setSelectedType] = useState<string | null>(
    DEFAULT_BY_OPTION.value
  );

  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    DEFAULT_SELECTED_INSTRUCTOR.value
  );

  const [selectedSemester, setSelectedSemester] = useState<string | null>(
    DEFAULT_SELECTED_SEMESTER.value
  );

  // some crazy cyclic dependencies here, averted by the fact that options changes
  // depend on the value of the "byData"
  const getInstructorOptions = (
    semester: string | null = null,
    shouldSetSelectedInstructor = true
  ) => {
    const list = [DEFAULT_SELECTED_INSTRUCTOR];
    if (!course) return list;

    const localSelectedSemester = semester ? semester : selectedSemester;

    const instructorSet = new Set();
    course?.classes.forEach((c) => {
      // get only current semester if getting by semester
      if (!c.gradeDistribution.average) return;
      if (selectedType === InputType.Term) {
        if (`${c.semester} ${c.year}` !== localSelectedSemester) return;
      }
      c.primarySection.meetings.forEach((m) => {
        // instructor for current class lecture
        m.instructors.forEach((i) => {
          instructorSet.add(`${i.familyName}, ${i.givenName}`);
        });
      });
    });
    const opts = [...instructorSet].map((v) => {
      // create OptionTypes
      return { value: v as string, label: v as string };
    });
    if (opts.length === 1 && selectedType === InputType.Term) {
      // If only one choice, select it
      if (selectedInstructor !== opts[0].value && shouldSetSelectedInstructor)
        setSelectedInstructor(opts[0].value);
      return opts;
    }
    return [...list, ...opts];
  };

  const instructorOptions = useMemo(getInstructorOptions, [
    course,
    selectedType,
    selectedSemester,
  ]);

  const getSemesterOptions = (
    instructor: string | null = null,
    shouldSetSelectedSemester = true
  ) => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!course) return list;
    const localSelectedInstructor = instructor
      ? instructor
      : selectedInstructor;
    const filteredClasses =
      selectedType === InputType.Term
        ? course.classes // all if by semester
        : localSelectedInstructor === "all"
          ? []
          : course.classes.filter((c) =>
              c.primarySection.meetings.find((m) =>
                m.instructors.find(
                  (i) =>
                    localSelectedInstructor ===
                    `${i.familyName}, ${i.givenName}`
                )
              )
            );
    const filteredOptions = filteredClasses
      .filter(({ gradeDistribution }) => gradeDistribution.average)
      .filter(
        ({ year, semester }, index) =>
          index ===
          filteredClasses.findIndex(
            (_class) => _class.semester === semester && _class.year === year
          )
      )
      .toSorted(sortByTermDescending)
      .map((t) => {
        const str = `${t.semester} ${t.year}`;
        return {
          value: str,
          label: str,
        };
      });
    if (filteredOptions.length == 1) {
      // if only one option, select it
      if (
        selectedSemester != filteredOptions[0].value &&
        shouldSetSelectedSemester
      )
        setSelectedSemester(filteredOptions[0].value);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  };

  const semesterOptions = useMemo(getSemesterOptions, [
    course,
    selectedType,
    selectedInstructor,
  ]);

  const add = async () => {
    let input: Input;

    if (
      !selectedInstructor ||
      !selectedCourse ||
      !selectedSemester ||
      !selectedType
    )
      return;

    addRecent(RecentType.Course, {
      subject: selectedCourse.subject,
      number: selectedCourse.number,
    });

    // Course input
    if (selectedInstructor === "all" && selectedSemester === "all") {
      input = {
        subject: selectedCourse.subject,
        courseNumber: selectedCourse.number,
      };
    }
    // Term input
    else if (selectedType === InputType.Term) {
      const [semester, year] = selectedSemester.split(" ");

      if (selectedInstructor === "all") {
        input = {
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          type: InputType.Term,
          year: parseInt(year),
          semester: semester as Semester,
        };
      } else {
        const [familyName, givenName] = selectedInstructor.split(", ");

        input = {
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          type: InputType.Term,
          year: parseInt(year),
          semester: semester as Semester,
          familyName,
          givenName,
        };
      }
    }

    // Instructor input
    else {
      const [familyName, givenName] = selectedInstructor.split(", ");

      if (selectedSemester === "all") {
        input = {
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          type: InputType.Instructor,
          familyName,
          givenName,
        };
      } else {
        const [semester, year] = selectedSemester.split(" ");

        input = {
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          type: InputType.Instructor,
          year: parseInt(year),
          semester: semester as Semester,
          familyName,
          givenName,
        };
      }
    }

    // Do not fetch duplicates
    const existingOutput = outputs.find((output) =>
      isInputEqual(output.input, input)
    );

    if (existingOutput) return;

    setLoading(true);

    try {
      const response = await client.query<ReadGradeDistributionResponse>({
        query: READ_GRADE_DISTRIBUTION,
        variables: input,
      });

      const output: Output = {
        hidden: false,
        active: false,
        color: LIGHT_COLORS[outputs.length],
        gradeDistribution: response.data.grade,
        input,
      };

      setOutputs((outputs) => [...outputs, output]);

      searchParams.append("input", getInputSearchParam(input));
      setSearchParams(searchParams);

      setLoading(false);
    } catch {
      // TODO: Error handling

      setLoading(false);

      return;
    }
  };

  const disabled = useMemo(
    () => loading || outputs.length === 4,
    [loading, outputs]
  );

  const handleCourseSelect = (course: ICourse) => {
    setSelectedCourse(course);

    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR.value);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER.value);
    if (selectedType === InputType.Instructor) {
      instructorSelectRef.current?.focus();
      instructorSelectRef.current?.openMenu();
    } else {
      semesterSelectRef.current?.focus();
      semesterSelectRef.current?.openMenu();
    }
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR.value);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER.value);
  };

  return (
    <Flex direction="row" gap="3">
      <Box flexGrow="1">
        <CourseSearch
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
          selectedCourse={selectedCourse}
          inputStyle={{
            height: 44,
          }}
        />
      </Box>
      <Box flexGrow="1">
        <Select
          options={TYPE_OPTIONS}
          disabled={disabled || !selectedCourse}
          value={selectedType}
          onChange={(s) => {
            setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR.value);
            setSelectedSemester(DEFAULT_SELECTED_SEMESTER.value);
            if (!Array.isArray(s)) setSelectedType(s);
            if (s === InputType.Instructor) {
              instructorSelectRef.current?.focus();
              instructorSelectRef.current?.openMenu();
            } else {
              semesterSelectRef.current?.focus();
              semesterSelectRef.current?.openMenu();
            }
          }}
          variant="foreground"
        />
      </Box>
      <Flex
        direction={
          selectedType === InputType.Instructor ? "row" : "row-reverse"
        }
        flexGrow="1"
        gap="4"
      >
        <Box flexGrow="1">
          <Select
            ref={instructorSelectRef}
            options={instructorOptions}
            disabled={disabled || !selectedCourse}
            value={selectedInstructor}
            onChange={(s) => {
              if (Array.isArray(s) || !s) return;
              setSelectedInstructor(s);
              const localSemesterOptions = getSemesterOptions(s, false);
              if (
                selectedType === InputType.Instructor &&
                localSemesterOptions.length > 1
              ) {
                semesterSelectRef.current?.focus();
                semesterSelectRef.current?.openMenu();
              }
            }}
            variant="foreground"
          />
        </Box>
        <Box flexGrow="1">
          <Select
            ref={semesterSelectRef}
            options={semesterOptions}
            disabled={disabled || !selectedCourse}
            value={selectedSemester}
            onChange={(s) => {
              if (Array.isArray(s)) return;
              setSelectedSemester(s);
              const localInstructorOptions = getInstructorOptions(s, false);
              if (
                selectedType === InputType.Term &&
                localInstructorOptions.length > 1
              ) {
                instructorSelectRef.current?.focus();
                instructorSelectRef.current?.openMenu();
              }
            }}
            variant="foreground"
          />
        </Box>
      </Flex>
      <Button
        variant="solid"
        onClick={() => add()}
        disabled={
          disabled ||
          !selectedCourse ||
          !selectedInstructor ||
          !selectedSemester
        }
        className={styles.addButton}
      >
        Add course
      </Button>
    </Flex>
  );
}
