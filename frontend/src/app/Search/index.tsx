import { FormEvent, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { ArrowRight, Calendar } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { GET_COURSE, ICourse, Semester } from "@/lib/api";

import styles from "./Search.module.scss";

export default function Search() {
  const [input, setInput] = useState("");
  const [courses, setCourses] = useState<ICourse[]>([]);
  const apolloClient = useApolloClient();

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
      `http://localhost:3002/query?input=${encodeURIComponent(input)}&topK=25`
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
        <Header invert />
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              value={input}
              // Required to display the placeholder conditionally
              placeholder=""
              onChange={(event) => setInput(event.target.value)}
            />
            <p className={styles.placeholder}>Search for a course</p>
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
            {courses.map((course) => {
              const score = {
                [Semester.Fall]: 3,
                [Semester.Summer]: 2,
                [Semester.Spring]: 1,
              };

              const { year, semester } = [...course.classes].sort(
                (a, b) =>
                  a.year - b.year || score[a.semester] - score[b.semester]
              )[0];

              return (
                <div className={styles.course} key={course.number}>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
