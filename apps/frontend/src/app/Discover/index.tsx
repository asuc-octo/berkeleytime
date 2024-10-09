import { FormEvent, useState } from "react";

import { useApolloClient, useQuery } from "@apollo/client";
import { ArrowRight, Calendar } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import Container from "@/components/Container";
import CourseDrawer from "@/components/CourseDrawer";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import Units from "@/components/Units";
import {
  GET_COURSE,
  GET_COURSES,
  GetCoursesResponse,
  ICourse,
  Semester,
} from "@/lib/api";

import styles from "./Discover.module.scss";
import Placeholder from "./Placeholder";

const score = {
  [Semester.Fall]: 4,
  [Semester.Summer]: 3,
  [Semester.Spring]: 2,
  [Semester.Winter]: 1,
};

export default function Discover() {
  const [input, setInput] = useState("");
  const [courses, setCourses] = useState<ICourse[]>([]);
  const apolloClient = useApolloClient();

  const { data } = useQuery<GetCoursesResponse>(GET_COURSES);

  console.log(data);

  const getCourse = async (name: string) => {
    const [subject, courseNumber] = name.split(" ");

    const { data } = await apolloClient.query<{ course: ICourse }>({
      query: GET_COURSE,
      variables: { subject, courseNumber },
    });

    if (!data) return;

    return data.course;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const response = await fetch(
      `http://localhost:3002/query?input=${encodeURIComponent(input)}&topK=24`
    );

    if (!response.ok) return;

    const { matches } = (await response.json()) as {
      matches: { id: string }[];
    };

    const courses = await Promise.all(
      matches.map(({ id: name }) => getCourse(name))
    );

    setCourses(
      courses.filter(
        (course) => course && course.classes.length !== 0
      ) as ICourse[]
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <NavigationBar invert />
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              value={input}
              // Required to display the placeholder conditionally
              placeholder=""
              onChange={(event) => setInput(event.target.value)}
            />
            <Placeholder className={styles.placeholder} />
            <Button className={styles.button}>
              Search
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
      <Container>
        <div className={styles.body}>
          <div className={styles.sideBar}></div>
          <div className={styles.view}>
            {courses
              .sort((a, b) => {
                const getTerm = (course: ICourse) => {
                  return [...course.classes].sort(
                    (a, b) =>
                      a.year - b.year || score[a.semester] - score[b.semester]
                  )[0];
                };

                return (
                  getTerm(b).year - getTerm(a).year ||
                  score[getTerm(b).semester] - score[getTerm(a).semester]
                );
              })
              .map((course) => {
                const { year, semester } = [...course.classes].sort(
                  (a, b) =>
                    a.year - b.year || score[a.semester] - score[b.semester]
                )[0];

                const { unitsMax, unitsMin } = course.classes.reduce(
                  (acc, { unitsMax, unitsMin }) => ({
                    unitsMax: Math.max(acc.unitsMax, unitsMax),
                    unitsMin: Math.min(acc.unitsMin, unitsMin),
                  }),
                  { unitsMax: 0, unitsMin: 0 }
                );

                return (
                  <CourseDrawer
                    subject={course.subject}
                    number={course.number}
                    key={course.number}
                  >
                    <div className={styles.course}>
                      <p className={styles.title}>
                        {course.subject} {course.number}
                      </p>
                      <p className={styles.description}>{course.title}</p>
                      <div className={styles.row}>
                        <AverageGrade gradeAverage={course.gradeAverage} />
                        <div className={styles.badge}>
                          <Calendar />
                          {semester} {year}
                        </div>
                        <Units unitsMax={unitsMax} unitsMin={unitsMin} />
                      </div>
                    </div>
                  </CourseDrawer>
                );
              })}
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
