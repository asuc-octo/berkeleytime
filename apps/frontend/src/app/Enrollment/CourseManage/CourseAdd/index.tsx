import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { Plus } from "iconoir-react";
import { SingleValue } from "react-select";

import { Select } from "@repo/theme";
import { Button, Flex } from "@repo/theme";

import { useReadCourseWithInstructor } from "@/hooks/api";
import { GET_COURSES, GetCoursesResponse, ICourse, Semester } from "@/lib/api";

import styles from "./CourseAdd.module.scss";

type CourseOptionType = {
  value: ICourse;
  label: string;
};

type OptionType = {
  value: string;
  label: string;
};

interface SelectedCourse {
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  givenName?: string;
  familyName?: string;
}

interface CourseAddProps {
  selectedCourses: SelectedCourse[];
  addCourse: (course: ICourse, term: string, instructor: string) => void;
}

// called instructor in frontend but actually we're letting users select a diff class
const DEFAULT_SELECTED_CLASS = { value: "all", label: "All Instructors" };
const DEFAULT_SELECTED_SEMESTER = { value: "all", label: "All Semesters" };
const DEFAULT_BY_OPTION = { value: "instructor", label: "By Instructor" };

export default function CourseAdd({
  selectedCourses,
  addCourse,
}: CourseAddProps) {
  const { data } = useQuery<GetCoursesResponse>(GET_COURSES);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

  const coursesOptions = useMemo(() => {
    if (!data) return [];
    return data?.courses.map((c) => {
      return {
        value: c,
        label: `${c.subject} ${c.number}`,
      };
    });
  }, [data]);

  const [selectedClass, setSelectedClass] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_CLASS);
  const [selectedSemester, setSelectedSemester] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_SEMESTER);

  // some crazy cyclic dependencies here, averted by the fact that options changes
  // dpeend on the value of the "byData"
  const classOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_CLASS];
    if (!courseData) return list;

    const mySet = new Set();
    courseData?.classes.forEach((c) => {
      if (`${c.semester} ${c.year}` !== selectedSemester?.value) return;
      let allInstructors = "";
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          allInstructors = `${allInstructors} ${i.familyName}, ${i.givenName};`;
        });
      });
      mySet.add(`${allInstructors} ${c.number}`)
    });
    const opts = [...mySet].map((v) => {
      return { value: v as string, label: v as string };
    });
    if (opts.length === 1) {
      if (selectedClass !== opts[0]) setSelectedClass(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [courseData, selectedSemester]);

  const semesterOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
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

  return (
    <Flex direction="row" gap="3">
      <div className={styles.courseSelectCont}>
        <Select
          options={coursesOptions}
          value={selectedCourse}
          onChange={(v) => {
            setSelectedCourse(v);
          }}
        />
      </div>
      <div className={styles.selectCont}>
        <Select
          options={semesterOptions}
          value={selectedSemester}
          onChange={(s) => {
            setSelectedSemester(s);
          }}
        />
      </div>
      <div className={styles.selectCont}>
        <Select
          options={classOptions}
          value={selectedClass}
          onChange={(s) => {
            setSelectedClass(s);
          }}
        />
      </div>
      <Button
        className={styles.button}
        variant="solid"
        onClick={() => {
          if (!selectedCourse || !selectedSemester || !selectedClass)
            return;
          addCourse(
            selectedCourse.value,
            selectedSemester.value,
            selectedClass.value
          );
        }}
        disabled={selectedCourses.length >= 4}
      >
        Add course
        <Plus />
      </Button>
    </Flex>
  );
}
