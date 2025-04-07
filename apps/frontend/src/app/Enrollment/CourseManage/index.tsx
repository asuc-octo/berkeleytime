import classNames from "classnames";
import { useSearchParams } from "react-router-dom";

import { Flex } from "@repo/theme";

import { ICourse, IEnrollment, Semester } from "@/lib/api";

import CourseAdd from "./CourseAdd";
import styles from "./CourseManage.module.scss";
import GradesCard from "./EnrollmentCard";

interface SelectedCourse {
  color: string;
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  enrollmentHistory: IEnrollment;
  sectionNumber: string;
  active: boolean;
  hidden: boolean;
}

interface SideBarProps {
  selectedCourses: SelectedCourse[];
  hideCourse: (i: number) => void;
  setActive: (i: number) => void;
}

function courseTermClassToURL(
  subject: string,
  number: string,
  sectionNumber: string | undefined,
  semester: Semester | undefined,
  year: number | undefined
) {
  if (!sectionNumber && !semester) return `${subject};${number}`;
  else if (!sectionNumber) return `${subject};${number};T;${year}:${semester}`;
  else
    return `${subject};${number};T;${year}:${semester};${sectionNumber}`;
}

export default function CourseManage({
  selectedCourses,
  setActive,
  hideCourse,
}: SideBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function addCourse(course: ICourse, term: string, sectionNumber: string) {
    const [semester, year] =
      term === "all" ? [undefined, undefined] : term.split(" ");
    searchParams.append(
      "input",
      courseTermClassToURL(
        course.subject,
        course.number,
        (sectionNumber === "all") ? undefined : sectionNumber,
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
            course.sectionNumber
              ? `LEC ${course.sectionNumber}`
              : "All Instructors";
          const semester =
            course.semester && course.year
              ? `${course.semester} ${course.year}`
              : "All Semesters";
          return (
            <div className={styles.courseCard} key={index}>
              <GradesCard
                color={course.color}
                subject={course.subject}
                number={course.courseNumber}
                description={`${semester} • ${instructor}`}
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
