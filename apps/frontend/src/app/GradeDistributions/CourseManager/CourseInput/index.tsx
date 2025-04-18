import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import Select, { SelectInstance, SingleValue } from "react-select";

import { Box, createSelectStyles } from "@repo/theme";
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

type CourseOptionType = {
  value: ICourse;
  label: string;
};

type OptionType = {
  value: string;
  label: string;
};

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

  const semesterSelectRef = useRef<SelectInstance<OptionType, false>>(null);
  const instructorSelectRef = useRef<SelectInstance<OptionType, false>>(null);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: course } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

  const [selectedType, setSelectedType] =
    useState<SingleValue<OptionType>>(DEFAULT_BY_OPTION);

  const [selectedInstructor, setSelectedInstructor] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_INSTRUCTOR);

  const [selectedSemester, setSelectedSemester] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_SEMESTER);

  // some crazy cyclic dependencies here, averted by the fact that options changes
  // depend on the value of the "byData"
  const instructorOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_INSTRUCTOR];
    if (!course) return list;

    const instructorSet = new Set();
    course?.classes.forEach((c) => {
      // get only current semester if getting by semester
      if (!c.gradeDistribution.average) return;
      if (selectedType?.value === InputType.Term) {
        if (`${c.semester} ${c.year}` !== selectedSemester?.value) return;
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
    if (opts.length === 1 && selectedType?.value === InputType.Term) {
      // If only one choice, select it
      if (selectedInstructor !== opts[0]) setSelectedInstructor(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [course, selectedType?.value, selectedSemester?.value]);

  const semesterOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!course) return list;
    const filteredClasses =
      selectedType?.value === InputType.Term
        ? course.classes // all if by semester
        : selectedInstructor?.value === "all"
          ? []
          : course.classes.filter((c) =>
              c.primarySection.meetings.find((m) =>
                m.instructors.find(
                  (i) =>
                    selectedInstructor?.value ===
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
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [course, selectedType?.value, selectedInstructor?.value]);

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
      subject: selectedCourse.value.subject,
      number: selectedCourse.value.number,
    });

    // Course input
    if (
      selectedInstructor.value === "all" &&
      selectedSemester.value === "all"
    ) {
      input = {
        subject: selectedCourse.value.subject,
        courseNumber: selectedCourse.value.number,
      };
    }
    // Term input
    else if (selectedType.value === InputType.Term) {
      const [semester, year] = selectedSemester.value.split(" ");

      if (selectedInstructor.value === "all") {
        input = {
          subject: selectedCourse.value.subject,
          courseNumber: selectedCourse.value.number,
          type: InputType.Term,
          year: parseInt(year),
          semester: semester as Semester,
        };
      } else {
        const [familyName, givenName] = selectedInstructor.value.split(", ");

        input = {
          subject: selectedCourse.value.subject,
          courseNumber: selectedCourse.value.number,
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
      const [familyName, givenName] = selectedInstructor.value.split(", ");

      if (selectedSemester.value === "all") {
        input = {
          subject: selectedCourse.value.subject,
          courseNumber: selectedCourse.value.number,
          type: InputType.Instructor,
          familyName,
          givenName,
        };
      } else {
        const [semester, year] = selectedSemester.value.split(" ");

        input = {
          subject: selectedCourse.value.subject,
          courseNumber: selectedCourse.value.number,
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
    setSelectedCourse({
      value: course,
      label: `${course.subject} ${course.number}`,
    });

    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
    if (selectedType?.value === InputType.Instructor) {
      instructorSelectRef.current?.focus();
      instructorSelectRef.current?.openMenu("first");
    } else {
      semesterSelectRef.current?.focus();
      semesterSelectRef.current?.openMenu("first");
    }
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
  };

  return (
    <Flex direction="row" gap="3">
      <Box flexGrow="1">
        <CourseSearch
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
          selectedCourse={
            selectedCourse
              ? {
                  subject: selectedCourse.value.subject,
                  courseNumber: selectedCourse.value.number,
                }
              : undefined
          }
        />
      </Box>
      <Box flexGrow="1">
        <Select
          styles={createSelectStyles<OptionType, false>()}
          options={TYPE_OPTIONS}
          isDisabled={disabled}
          value={selectedType}
          onChange={(s) => {
            setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
            setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
            setSelectedType(s);
            if (s?.value === InputType.Instructor) {
              instructorSelectRef.current?.focus();
              instructorSelectRef.current?.openMenu("first");
            } else {
              semesterSelectRef.current?.focus();
              semesterSelectRef.current?.openMenu("first");
            }
          }}
          components={{
            IndicatorSeparator: () => null,
          }}
        />
      </Box>
      <Flex
        direction={
          selectedType?.value === InputType.Instructor ? "row" : "row-reverse"
        }
        flexGrow="1"
        gap="4"
      >
        <Box flexGrow="1">
          <Select
            styles={createSelectStyles<OptionType, false>()}
            ref={instructorSelectRef}
            options={instructorOptions}
            isDisabled={disabled}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
              if (
                selectedType?.value === InputType.Instructor &&
                semesterOptions.length > 1
              ) {
                semesterSelectRef.current?.focus();
                semesterSelectRef.current?.openMenu("first");
              }
            }}
            components={{
              IndicatorSeparator: () => null,
            }}
          />
        </Box>
        <Box flexGrow="1">
          <Select
            styles={createSelectStyles<OptionType, false>()}
            ref={semesterSelectRef}
            options={semesterOptions}
            isDisabled={disabled}
            value={selectedSemester}
            onChange={(s) => {
              setSelectedSemester(s);
              if (
                selectedType?.value === InputType.Term &&
                instructorOptions.length > 1
              ) {
                instructorSelectRef.current?.focus();
                instructorSelectRef.current?.openMenu("first");
              }
            }}
            components={{
              IndicatorSeparator: () => null,
            }}
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
