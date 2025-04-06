import { useEffect, useState } from "react";

import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import { Card, Flex } from "@repo/theme";

import { useReadCourse } from "@/hooks/api";
import { GradeDistribution, ICourse, Semester } from "@/lib/api";

import CourseAdd from "./CourseAdd";
import styles from "./CourseManage.module.scss";
import GradesCard from "./GradesCard";

interface SelectedCourse {
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  givenName?: string;
  familyName?: string;
  gradeDistribution: GradeDistribution;
  active: boolean;
  hidden: boolean;
}

interface SideBarProps {
  selectedCourses: SelectedCourse[];
  hideCourse: (i: number) => void;
  setActive: (i: number) => void;
}

function courseTermProfToURL(
  subject: string,
  number: string,
  givenName: string | undefined,
  familyName: string | undefined,
  semester: Semester | undefined,
  year: number | undefined
) {
  if (!givenName && !semester) return `${subject};${number}`;
  else if (!semester)
    return `${subject};${number};P;${givenName}:${familyName}`;
  else if (!givenName) return `${subject};${number};T;${year}:${semester}`;
  else
    return `${subject};${number};T;${year}:${semester};${givenName}:${familyName}`;
}

export default function CourseManage({
  selectedCourses,
  setActive,
  hideCourse,
}: SideBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function addCourse(course: ICourse, term: String, instructor: String) {
    const [lastName, firstName] =
      instructor === "all" ? [undefined, undefined] : instructor.split(", ");
    const [semester, year] =
      term === "all" ? [undefined, undefined] : term.split(" ");
    searchParams.append(
      "input",
      courseTermProfToURL(
        course.subject,
        course.number,
        firstName,
        lastName,
        semester as Semester,
        year ? Number.parseInt(year) : undefined
      )
    );
    setSearchParams(searchParams);
  }

  function deleteCourse(index: number) {
    // maintaining order is tricky when avoiding deleting all duplicates
    const order = searchParams.getAll("input");
    if (order.length == 1) searchParams.delete("input");
    else {
      order.forEach((inp, i) => {
        if (i == 0) searchParams.set("input", inp);
        else {
          if (i == index) return;
          searchParams.append("input", inp);
        }
      });
    }
    setSearchParams(searchParams);
  }

  return (
    <div className={styles.root}>
      <CourseAdd selectedCourses={selectedCourses} addCourse={addCourse} />
      <Flex direction="row" gap="4">
        {Array.from({ length: 4 }, (_, index) => {
          if (index >= selectedCourses.length) {
            return (
              <div
                className={classNames(styles.courseCard, styles.blank)}
                key={index}
              ></div>
            );
          }
          const course = selectedCourses[index];
          const instructor =
            course.familyName && course.givenName
              ? `${course.givenName} ${course.familyName}`
              : "All Instructors";
          const semester =
            course.semester && course.year
              ? `${course.semester} ${course.year}`
              : "All Semesters";
          return (
            <div className={styles.courseCard} key={index}>
              <GradesCard
                subject={course.subject}
                number={course.courseNumber}
                description={`${instructor} • ${semester}`}
                gradeDistribution={course.gradeDistribution}
                hidden={course.hidden}
                active={course.active}
                onClick={() => {
                  setActive(index);
                }}
                onClickDelete={() => {
                  deleteCourse(index);
                }}
                onClickHide={() => {
                  hideCourse(index);
                }}
              />
            </div>
          );
        })}
      </Flex>
    </div>
  );
}
