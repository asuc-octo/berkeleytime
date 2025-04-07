import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { Plus } from "iconoir-react";
import Select, { SingleValue } from "react-select";

import { Button, Flex } from "@repo/theme";

import CourseSearch from "@/components/CourseSearch";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { GET_COURSES, GetCoursesResponse, ICourse, Semester } from "@/lib/api";
import { addRecentCourseGrade } from "@/lib/recent";

import styles from "./CourseAdd.module.scss";

type OptionType = {
  value: string;
  label: string;
};

type CourseOptionType = {
  value: ICourse;
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
  const {} = useQuery<GetCoursesResponse>(GET_COURSES);

  const [selectedCourse, setSelectedCourse] =
    useState<SingleValue<CourseOptionType>>(null);

  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.value.subject ?? "",
    selectedCourse?.value.number ?? ""
  );

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

  const handleCourseSelect = (course: ICourse) => {
    setSelectedCourse({
      value: course,
      label: `${course.subject} ${course.number}`,
    });

    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
  };

  const handleCourseClear = () => {
    setSelectedCourse(null);
    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
    setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
  };

  return (
    <Flex direction="row" gap="3">
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
      <div className={styles.selectCont}>
        <Select
          classNamePrefix="react-select"
          options={byOptions}
          value={byData}
          onChange={(s) => {
            setSelectedCourse(selectedCourse);
            setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
            setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
            setByData(s);
          }}
        />
      </div>
      <div className={styles.selectCont}>
        {byData?.value === "instructor" ? (
          <Select
            classNamePrefix="react-select"
            options={instructorOptions}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
            }}
          />
        ) : (
          <Select
            classNamePrefix="react-select"
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
            classNamePrefix="react-select"
            options={instructorOptions}
            value={selectedInstructor}
            onChange={(s) => {
              setSelectedInstructor(s);
            }}
          />
        ) : (
          <Select
            classNamePrefix="react-select"
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
          addRecentCourseGrade({
            subject: selectedCourse.value.subject,
            courseNumber: selectedCourse.value.number,
            number: selectedCourse.value.number,
          });
        }}
        disabled={selectedCourses.length >= 4}
      >
        Add course
        <Plus />
      </Button>
    </Flex>
  );
}
