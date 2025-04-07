import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { useApolloClient, useQuery } from "@apollo/client";
import { Plus } from "iconoir-react";
import { useSearchParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { Box, Select } from "@repo/theme";
import { Button, Flex } from "@repo/theme";

import { useReadCourseWithInstructor } from "@/hooks/api";
import {
  GET_COURSES,
  GetCoursesResponse,
  ICourse,
  READ_GRADE_DISTRIBUTION,
  ReadGradeDistributionResponse,
  Semester,
} from "@/lib/api";

import {
  Input,
  InputType,
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

  const { data: courses, loading: coursesLoading } =
    useQuery<GetCoursesResponse>(GET_COURSES);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: course } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

  const coursesOptions = useMemo(() => {
    if (!courses) return [];
    return courses?.courses.map((c) => {
      return {
        value: c,
        label: `${c.subject} ${c.number}`,
      };
    });
  }, [courses]);

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
      if (selectedType?.value === "semester") {
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
    if (opts.length === 1 && selectedType?.value === "semester") {
      // If only one choice, select it
      if (selectedInstructor !== opts[0]) setSelectedInstructor(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [
    course,
    selectedType?.value,
    selectedSemester?.value,
    selectedInstructor,
  ]);

  const semesterOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!course) return list;
    const filteredClasses =
      selectedType?.value === "semester"
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
    const filteredOptions = Array.from(
      new Set(filteredClasses.map((c) => `${c.semester} ${c.year}`))
    ).map((t) => {
      return {
        value: t,
        label: t,
      };
    });
    if (filteredOptions.length == 1) {
      // if only one option, select it
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [
    course,
    selectedType?.value,
    selectedInstructor?.value,
    selectedSemester,
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
    () => loading || coursesLoading || outputs.length === 4,
    [loading, coursesLoading, outputs]
  );

  return (
    <Flex direction="row" gap="3">
      <Box flexGrow="1">
        <Select
          options={coursesOptions}
          isDisabled={disabled}
          value={selectedCourse}
          onChange={(v) => {
            setSelectedCourse(v);
          }}
        />
      </Box>
      <Box flexGrow="1">
        <Select
          options={TYPE_OPTIONS}
          isDisabled={disabled}
          value={selectedType}
          onChange={(s) => {
            setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
            setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
            setSelectedType(s);
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
            options={instructorOptions}
            isDisabled={disabled}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
            }}
          />
        </Box>
        <Box flexGrow="1">
          <Select
            options={semesterOptions}
            isDisabled={disabled}
            value={selectedSemester}
            onChange={(s) => {
              setSelectedSemester(s);
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
      >
        Add course
        <Plus />
      </Button>
    </Flex>
  );
}
