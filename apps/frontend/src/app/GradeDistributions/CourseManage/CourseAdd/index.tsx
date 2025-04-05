import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { ArrowDown, ArrowUp, Plus } from "iconoir-react";
import Select, { SingleValue } from "react-select";

import { Button, Flex, IconButton } from "@repo/theme";

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

const DEFAULT_SELECTED_INSTRUCTOR = { value: "all", label: "All Instructors" };
const DEFAULT_SELECTED_SEMESTER = { value: "all", label: "All Semesters" };
const DEFAULT_BY_OPTION = { value: "instructor", label: "By Instructor" };

const byOptions = [
  { value: "instructor", label: "By Instructor" },
  { value: "semester", label: "By Semester" },
];

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

  const [byData, setByData] =
    useState<SingleValue<OptionType>>(DEFAULT_BY_OPTION);
  const [selectedInstructor, setSelectedInstructor] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_INSTRUCTOR);
  const [selectedSemester, setSelectedSemester] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_SEMESTER);

  // some crazy cyclic dependencies here, averted by the fact that options changes
  // dpeend on the value of the "byData"
  const instructorOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_INSTRUCTOR];
    if (!courseData) return list;

    console.log(courseData.classes);

    const mySet = new Set();
    courseData?.classes.forEach((c) => {
      if (byData?.value === "semester") {
        if (`${c.semester} ${c.year}` !== selectedSemester?.value) return;
      }
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          mySet.add(`${i.familyName}, ${i.givenName}`);
        });
      });
    });
    const opts = [...mySet].map((v) => {
      return { value: v as string, label: v as string };
    });
    if (opts.length === 1 && byData?.value === "semester") {
      if (selectedInstructor !== opts[0]) setSelectedInstructor(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [courseData, selectedSemester, byData]);

  const semesterOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!courseData) return list;
    const filteredClasses =
      byData?.value === "semester"
        ? courseData.classes
        : selectedInstructor?.value === "all"
          ? []
          : courseData.classes.filter((c) =>
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
    console.log(filteredOptions);
    if (filteredOptions.length == 1) {
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [courseData, selectedInstructor, byData]);

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
          options={byOptions}
          value={byData}
          onChange={(s) => {
            setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
            setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
            setByData(s);
          }}
        />
      </div>
      <div className={styles.selectCont}>
        {byData?.value === "instructor" ? (
          <Select
            options={instructorOptions}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
            }}
          />
        ) : (
          <Select
            options={semesterOptions}
            value={selectedSemester}
            onChange={(s) => {
              setSelectedSemester(s);
            }}
          />
        )}
      </div>
      <div className={styles.selectCont}>
        {byData?.value === "semester" ? (
          <Select
            options={instructorOptions}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
            }}
          />
        ) : (
          <Select
            options={semesterOptions}
            value={selectedSemester}
            onChange={(s) => {
              setSelectedSemester(s);
            }}
          />
        )}
      </div>
      <Button
        className={styles.button}
        variant="solid"
        onClick={() => {
          if (!selectedCourse || !selectedSemester || !selectedInstructor)
            return;
          addCourse(
            selectedCourse.value,
            selectedSemester.value,
            selectedInstructor.value
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
