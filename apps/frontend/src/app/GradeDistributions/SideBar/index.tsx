import { useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import CourseBrowser from "@/components/CourseBrowser";
import CourseCard from "@/components/CourseCard";
import DeleteContainer from "@/components/DeleteContainer";
import Drawer from "@/components/Drawer";
import { useReadCourse } from "@/hooks/api";
import { ICourse, Semester } from "@/lib/api";

import CourseAdd from "./CourseAdd";
import GradesDrawer from "./GradesDrawer";
import styles from "./SideBar.module.scss";

interface SelectedCourse {
  subject: string;
  courseNumber: string;
  year?: number;
  semester?: Semester;
  givenName?: string;
  familyName?: string;
}

interface SideBarProps {
  selectedCourses: SelectedCourse[];
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

export default function SideBar({ selectedCourses }: SideBarProps) {
  const [courseSelectOpen, setCourseSelectOpen] = useState(false);
  const [gradesDrawerOpen, setGradesDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: activeCourse } = useReadCourse(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? ""
  );

  useEffect(() => {
    if (!activeCourse) setGradesDrawerOpen(false);
    else setGradesDrawerOpen(true);
  }, [activeCourse]);

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

  return (
    <div className={styles.root}>
      <CourseAdd selectedCourses={selectedCourses} addCourse={addCourse} />
      {selectedCourses.map((course, index) => {
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
            <DeleteContainer
              onClick={() => {
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
              }}
            >
              <CourseCard
                subject={course.subject}
                number={course.courseNumber}
                customRow={`${instructor} • ${semester}`}
              />
            </DeleteContainer>
          </div>
        );
      })}
      <Drawer.Left
        open={courseSelectOpen}
        changeOpen={setCourseSelectOpen}
        content={
          <CourseBrowser
            onSelect={async (c) => {
              if (
                selectedCourse?.subject === c.subject &&
                selectedCourse?.number == c.number
              )
                setGradesDrawerOpen(true);
              else setSelectedCourse(c);
              setCourseSelectOpen(false);
            }}
            responsive={false}
            showGrades={false}
          />
        }
      />
      {selectedCourse ? (
        <GradesDrawer
          open={gradesDrawerOpen}
          setOpen={setGradesDrawerOpen}
          addCourse={addCourse}
          back={() => {
            setGradesDrawerOpen(false);
            setCourseSelectOpen(true);
          }}
          course={selectedCourse}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
