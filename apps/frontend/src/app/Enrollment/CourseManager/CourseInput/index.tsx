import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { SelectInstance, SingleValue } from "react-select";
import Select from "react-select";

import { createSelectStyles } from "@repo/theme";
import { Box, Button, Flex } from "@repo/theme";

import CourseSearch from "@/components/CourseSearch";
import { useReadCourseWithInstructor } from "@/hooks/api";
import {
  IClass,
  ICourse,
  READ_ENROLLMENT,
  ReadEnrollmentResponse,
  Semester,
} from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import { RecentType, addRecent } from "@/lib/recent";

import {
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

type ClassOptionType = {
  value: IClass | null;
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
const DEFAULT_SELECTED_CLASS = { value: null, label: "All Instructors" };

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const semesterSelectRef = useRef<SelectInstance<OptionType, false>>(null);
  const classSelectRef = useRef<SelectInstance<ClassOptionType, false>>(null);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

  const [selectedClass, setSelectedClass] = useState<
    SingleValue<ClassOptionType>
  >(DEFAULT_SELECTED_CLASS);
  const [selectedSemester, setSelectedSemester] =
    useState<SingleValue<OptionType>>();

  const semesterOptions: OptionType[] = useMemo(() => {
    // get all semesters
    const list: OptionType[] = [];
    if (!courseData) return list;
    const filterHasData = courseData.classes.filter(
      ({ primarySection: { enrollment } }) => enrollment?.latest
    );
    const filteredOptions = filterHasData
      .filter(
        ({ year, semester }, index) =>
          index ===
          filterHasData.findIndex(
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
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [courseData]);

  const classOptions: ClassOptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_CLASS];
    if (!courseData) return list;

    const classStrings: string[] = [];
    const classes: IClass[] = [];
    courseData?.classes
      .filter(
        (c) =>
          `${c.semester} ${c.year}` === selectedSemester?.value &&
          c ===
            courseData?.classes.find(
              (c2) =>
                `${c.semester} ${c.year} ${c.number}` ===
                `${c2.semester} ${c2.year} ${c2.number}`
            )
      )
      .forEach((c) => {
        if (!c.primarySection.enrollment?.latest) return;
        // only classes from current sem displayed
        let allInstructors = "";
        c.primarySection.meetings.forEach((m) => {
          m.instructors.forEach((i) => {
            // construct label
            allInstructors = `${allInstructors} ${i.familyName}, ${i.givenName};`;
          });
        });
        classStrings.push(`${allInstructors} ${c.primarySection.number}`);
        classes.push(c);
      });
    const opts = classStrings.map((v, i) => {
      return { value: classes[i], label: v };
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

    addRecent(RecentType.Course, {
      subject: selectedCourse.value.subject,
      number: selectedCourse.value.number,
    });

    const [semester, year] = selectedSemester.value.split(" ");

    const input = {
      subject: selectedCourse.value.subject,
      courseNumber: selectedCourse.value.number,
      year: parseInt(year),
      semester: semester as Semester,
      sectionNumber:
        selectedClass.value === null
          ? undefined
          : selectedClass.value.primarySection.number,
      sessionId:
        selectedClass.value?.semester === "Summer"
          ? selectedClass.value.sessionId
          : undefined,
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
    () => loading || outputs.length === 4,
    [loading, outputs]
  );

  const handleCourseSelect = (course: ICourse) => {
    setSelectedCourse({
      value: course,
      label: `${course.subject} ${course.number}`,
    });

    setSelectedClass(DEFAULT_SELECTED_CLASS);
    setSelectedSemester(null);
    semesterSelectRef.current?.focus();
    semesterSelectRef.current?.openMenu("first");
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
          ref={semesterSelectRef}
          styles={createSelectStyles<OptionType, false>()}
          options={semesterOptions}
          isDisabled={disabled}
          value={selectedSemester}
          onChange={(s) => {
            setSelectedClass(DEFAULT_SELECTED_CLASS);
            setSelectedSemester(s);
            if (classOptions.length > 1) {
              classSelectRef.current?.focus();
              classSelectRef.current?.openMenu("first");
            }
          }}
          components={{
            IndicatorSeparator: () => null,
          }}
        />
      </Box>
      <Box flexGrow="1">
        <Select
          ref={classSelectRef}
          styles={createSelectStyles<ClassOptionType, false>()}
          options={classOptions}
          isDisabled={disabled}
          value={selectedClass}
          onChange={(s) => {
            setSelectedClass(s);
          }}
          components={{
            IndicatorSeparator: () => null,
          }}
        />
      </Box>
      <Button
        variant="solid"
        onClick={() => add()}
        disabled={
          disabled || !selectedCourse || !selectedClass || !selectedSemester
        }
        className={styles.addButton}
      >
        Add course
      </Button>
    </Flex>
  );
}
