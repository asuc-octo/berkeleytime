import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { useApolloClient, useQuery } from "@apollo/client";
import { Plus } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { Select } from "@repo/theme";
import { Box, Button, Flex } from "@repo/theme";

import CourseSearch from "@/components/CourseSearch";
import { useReadCourseWithInstructor } from "@/hooks/api";
import {
  GET_COURSES,
  GetCoursesResponse,
  ICourse,
  READ_ENROLLMENT,
  ReadEnrollmentResponse,
  Semester,
} from "@/lib/api";
import { addRecentCourseGrade } from "@/lib/recent";

import {
  LIGHT_COLORS,
  Output,
  getInputSearchParam,
  isInputEqual,
} from "../../types";

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

// called instructor in frontend but actually we're letting users select a class
const DEFAULT_SELECTED_CLASS = { value: "all", label: "All Instructors" };

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: courses, loading: coursesLoading } =
    useQuery<GetCoursesResponse>(GET_COURSES);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

  const [selectedClass, setSelectedClass] = useState<SingleValue<OptionType>>(
    DEFAULT_SELECTED_CLASS
  );
  const [selectedSemester, setSelectedSemester] =
    useState<SingleValue<OptionType>>();

  const semesterOptions: OptionType[] = useMemo(() => {
    // get all semesters
    const list: OptionType[] = [];
    if (!courseData) return list;
    const filteredOptions = Array.from(
      new Set(courseData.classes.map((c) => `${c.semester} ${c.year}`))
    ).map((t) => {
      return {
        value: t,
        label: t,
      };
    });
    if (filteredOptions.length == 1) {
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [courseData]);

  const classOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_CLASS];
    if (!courseData) return list;

    const classStrings: string[] = [];
    const sectionNumbers: string[] = [];
    courseData?.classes.forEach((c) => {
      if (`${c.semester} ${c.year}` !== selectedSemester?.value) return;
      // only classes from current sem displayed
      let allInstructors = "";
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          // construct label
          allInstructors = `${allInstructors} ${i.familyName}, ${i.givenName};`;
        });
      });
      classStrings.push(`${allInstructors} ${c.primarySection.number}`);
      sectionNumbers.push(c.primarySection.number);
    });
    const opts = classStrings.map((v, i) => {
      return { value: sectionNumbers[i], label: v };
    });
    if (opts.length === 1) {
      // if only one option, select it
      if (selectedClass !== opts[0]) setSelectedClass(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [courseData, selectedSemester]);

  const add = async () => {
    if (!selectedClass || !selectedCourse || !selectedSemester) return;

    addRecentCourseGrade({
      subject: selectedCourse.value.subject,
      courseNumber: selectedCourse.value.number,
      number: selectedCourse.value.number,
    });

    const [semester, year] = selectedSemester.value.split(" ");

    const input = {
      subject: selectedCourse.value.subject,
      courseNumber: selectedCourse.value.number,
      year: parseInt(year),
      semester: semester as Semester,
      sectionNumber:
        selectedClass.value === "all" ? undefined : selectedClass.value,
    };
    // Do not fetch duplicates
    const existingOutput = outputs.find((output) =>
      isInputEqual(output.input, input)
    );

    if (existingOutput) return;

    setLoading(true);

    try {
      const response = await client.query<ReadEnrollmentResponse>({
        query: READ_ENROLLMENT,
        variables: input,
      });

      const output: Output = {
        hidden: false,
        active: false,
        color: LIGHT_COLORS[outputs.length],
        enrollmentHistory: response.data.enrollment,
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
    () => loading || coursesLoading || outputs.length === 4,
    [loading, coursesLoading, outputs]
  );

  const handleCourseSelect = (course: ICourse) => {
    setSelectedCourse({
      value: course,
      label: `${course.subject} ${course.number}`,
    });

    setSelectedClass(DEFAULT_SELECTED_CLASS);
    setSelectedSemester(null);
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedClass(DEFAULT_SELECTED_CLASS);
    setSelectedSemester(null);
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
          options={semesterOptions}
          isDisabled={disabled}
          value={selectedSemester}
          onChange={(s) => {
            setSelectedClass(DEFAULT_SELECTED_CLASS);
            setSelectedSemester(s);
          }}
        />
      </Box>
      <Box flexGrow="1">
        <Select
          options={classOptions}
          isDisabled={disabled}
          value={selectedClass}
          onChange={(s) => {
            setSelectedClass(s);
          }}
        />
      </Box>
      <Button
        variant="solid"
        onClick={() => add()}
        disabled={
          disabled || !selectedCourse || !selectedClass || !selectedSemester
        }
      >
        Add course
        <Plus />
      </Button>
    </Flex>
  );
}
