import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";

import { Box, Button, Flex, Select, SelectHandle } from "@repo/theme";

import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { ICourseWithInstructorClass } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import { GetEnrollmentDocument, Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";

import { Output, getInputSearchParam, isInputEqual } from "../../types";
import styles from "./CourseInput.module.scss";

interface CourseInputProps {
  outputs: Output[];
  setOutputs: Dispatch<SetStateAction<Output[]>>;
}

// called instructor in frontend but actually we're letting users select a class
const DEFAULT_SELECTED_CLASS = { value: null, label: "All Instructors" };

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const semesterSelectRef = useRef<SelectHandle>(null);
  const classSelectRef = useRef<SelectHandle>(null);

  const [loading, setLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    {
      skip: !selectedCourse,
    }
  );

  const [selectedClass, setSelectedClass] =
    useState<ICourseWithInstructorClass | null>(DEFAULT_SELECTED_CLASS.value);
  const [selectedSemester, setSelectedSemester] = useState<string | null>();

  const semesterOptions = useMemo(() => {
    // get all semesters
    const list: { value: string; label: string }[] = [];
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
      if (selectedSemester != filteredOptions[0].value)
        setSelectedSemester(filteredOptions[0].value);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [courseData, selectedSemester]);

  const getClassOptions = (
    semester: string | null = null,
    shouldSetSelectedClass = true
  ) => {
    const list = [DEFAULT_SELECTED_CLASS];
    if (!courseData) return list;

    const localSelectedSemester = semester ? semester : selectedSemester;

    const classStrings: string[] = [];
    const classes: ICourseWithInstructorClass[] = [];
    courseData?.classes
      .filter(
        (c) =>
          `${c.semester} ${c.year}` === localSelectedSemester &&
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
      if (selectedClass !== opts[0].value && shouldSetSelectedClass)
        setSelectedClass(opts[0].value);
      return opts;
    }
    return [...list, ...opts];
  };

  const classOptions = useMemo(getClassOptions, [
    courseData,
    selectedClass,
    selectedSemester,
  ]);

  const add = async () => {
    if (!selectedClass || !selectedCourse || !selectedSemester) return;

    addRecent(RecentType.Course, {
      subject: selectedCourse.subject,
      number: selectedCourse.number,
    });

    const [semester, year] = selectedSemester.split(" ");

    const input = {
      subject: selectedCourse.subject,
      courseNumber: selectedCourse.number,
      year: parseInt(year),
      semester: semester as Semester,
      sectionNumber:
        selectedClass === null
          ? undefined
          : selectedClass.primarySection.number,
      sessionId:
        selectedClass?.semester === "Summer"
          ? selectedClass.sessionId
          : undefined,
    };
    // Do not fetch duplicates
    const existingOutput = outputs.find((output) =>
      isInputEqual(output.input, input)
    );

    if (existingOutput) return;

    setLoading(true);

    try {
      const response = await client.query({
        query: GetEnrollmentDocument,
        variables: input,
      });

      if (!response.data || !response.data.enrollment) {
        throw response.error;
      }

      const output: Output = {
        hidden: false,
        active: false,
        // TODO: Error handling
        enrollmentHistory: response.data!.enrollment,
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

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);

    setSelectedClass(DEFAULT_SELECTED_CLASS.value);
    setSelectedSemester(null);
    semesterSelectRef.current?.focus();
    semesterSelectRef.current?.openMenu();
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedClass(DEFAULT_SELECTED_CLASS.value);
    setSelectedSemester(null);
  };

  return (
    <Flex direction="row" gap="3">
      <Box flexGrow="1">
        <CourseSelect
          onSelect={handleCourseSelect}
          onClear={handleCourseClear}
          selectedCourse={selectedCourse}
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
            setSelectedClass(DEFAULT_SELECTED_CLASS.value);
            setSelectedSemester(s);
            if (getClassOptions(s, false).length > 1) {
              classSelectRef.current?.focus();
              classSelectRef.current?.openMenu();
            }
          }}
          variant="foreground"
        />
      </Box>
      <Box flexGrow="1">
        <Select
          ref={classSelectRef}
          options={classOptions}
          disabled={disabled || !selectedCourse}
          value={selectedClass}
          onChange={(s) => {
            if (Array.isArray(s)) return;
            setSelectedClass(s);
          }}
          variant="foreground"
        />
      </Box>
      <Button
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
