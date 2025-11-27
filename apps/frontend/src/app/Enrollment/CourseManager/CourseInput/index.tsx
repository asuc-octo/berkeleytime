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

import {
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

// Format section number to #01, #02, etc.
const formatSectionNumber = (sectionNumber: string): string => {
  const num = parseInt(sectionNumber, 10);
  if (isNaN(num)) return `#${sectionNumber}`;
  return `#${num.toString().padStart(2, "0")}`;
};

// Encode class data into a string value for the select
const encodeClassValue = (
  classData: ICourseWithInstructorClass
): string => {
  return JSON.stringify({
    semester: classData.semester,
    year: classData.year,
    sectionNumber: classData.primarySection?.number,
    sessionId: classData.sessionId,
  });
};

// Decode class value back to structured data
const decodeClassValue = (
  value: string
): {
  semester: string;
  year: number;
  sectionNumber: string;
  sessionId?: string;
} | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export default function CourseInput({ outputs, setOutputs }: CourseInputProps) {
  const client = useApolloClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const semesterSelectRef = useRef<SelectHandle>(null);

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

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const buildInstructorList = (
    courseClass: ICourseWithInstructorClass | null
  ) => {
    if (!courseClass?.primarySection?.meetings) return [];
    const names = new Set<string>();
    courseClass.primarySection.meetings.forEach((meeting) => {
      meeting.instructors.forEach((instructor) => {
        const name = `${instructor.givenName} ${instructor.familyName}`.trim();
        if (name) names.add(name);
      });
    });
    return Array.from(names);
  };

  // Build semester options with section offerings
  const semesterOptions = useMemo(() => {
    if (!courseData) return [];

    // Filter classes that have enrollment data
    const classesWithEnrollment = courseData.classes
      .filter(({ primarySection }) => primarySection?.enrollment?.latest)
      .toSorted(sortByTermDescending);

    // Build options for each class (semester + section)
    const options = classesWithEnrollment.map((classData) => {
      const sectionNumber = classData.primarySection?.number ?? "";
      return {
        value: encodeClassValue(classData),
        label: `${classData.semester} ${classData.year}`,
        meta: formatSectionNumber(sectionNumber),
        // Store the class data for later use
        classData,
      };
    });

    return options;
  }, [courseData]);

  // Get the selected class data
  const selectedClassData = useMemo(() => {
    if (!selectedValue || !courseData) return null;
    const decoded = decodeClassValue(selectedValue);
    if (!decoded) return null;

    return courseData.classes.find(
      (c) =>
        c.semester === decoded.semester &&
        c.year === decoded.year &&
        c.primarySection?.number === decoded.sectionNumber
    );
  }, [selectedValue, courseData]);

  const add = async () => {
    if (!selectedCourse || !selectedClassData) return;

    if (!selectedClassData.primarySection) return;

    addRecent(RecentType.Course, {
      subject: selectedCourse.subject,
      number: selectedCourse.number,
    });

    const instructors = buildInstructorList(selectedClassData);

    const input = {
      subject: selectedCourse.subject,
      courseNumber: selectedCourse.number,
      year: selectedClassData.year,
      semester: selectedClassData.semester as Semester,
      sectionNumber: selectedClassData.primarySection.number,
      sessionId:
        selectedClassData.semester === "Summer"
          ? selectedClassData.sessionId
          : undefined,
      instructors,
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
        variables: {
          year: input.year,
          semester: input.semester,
          sessionId: input.sessionId,
          subject: input.subject,
          courseNumber: input.courseNumber,
          sectionNumber: input.sectionNumber,
        },
      });

      if (!response.data || !response.data.enrollment) {
        throw response.error;
      }

      const usedColors = new Set(outputs.map((output) => output.color));
      const availableColor =
        LIGHT_COLORS.find((color) => !usedColors.has(color)) || LIGHT_COLORS[0];

      const output: Output = {
        hidden: false,
        active: false,
        color: availableColor,
        data: response.data!.enrollment,
        input,
      };

      setOutputs((outputs) => [...outputs, output]);

      searchParams.append("input", getInputSearchParam(input));
      setSearchParams(searchParams);

      // Reset selectors back to defaults after adding a course
      setSelectedCourse(null);
      setSelectedValue(null);

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
    setSelectedValue(null);
    semesterSelectRef.current?.focus();
    semesterSelectRef.current?.openMenu();
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
          ref={semesterSelectRef}
          options={semesterOptions}
          disabled={disabled || !selectedCourse}
          searchable
          searchPlaceholder="Search semesters..."
          placeholder={!selectedCourse ? "Select a class first" : "Select a semester"}
          value={!selectedCourse ? null : selectedValue}
          onChange={(s) => {
            if (Array.isArray(s)) return;
            setSelectedValue(s);
          }}
          variant="foreground"
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
