import { FormEvent, useCallback, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { ArrowRight } from "iconoir-react";

import { Button } from "@repo/theme";

import CourseDrawer from "@/components/CourseDrawer";
import NavigationBar from "@/components/NavigationBar";
import { GET_COURSES, GetCoursesResponse, ICourse } from "@/lib/api";

import styles from "./Discover.module.scss";
import Placeholder from "./Placeholder";

interface RawResult {
  model: string;
  courses: [
    {
      subject: string;
      number: string;
      score?: number;
    },
  ];
}

interface Result {
  model: string;
  courses: ICourse[];
}

export default function Discover() {
  const [input, setInput] = useState("");

  const { data } = useQuery<GetCoursesResponse>(GET_COURSES);

  const courses = useMemo(() => data?.courses ?? [], [data]);

  const [results, setResults] = useState<Result[]>([]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      try {
        const response = await fetch(
          `http://localhost:8000/courses?query=${encodeURIComponent(input)}`
        );

        const data = (await response.json()) as RawResult[];

        const results = data.map((result) => {
          return {
            ...result,
            courses: result.courses
              .toSorted((a, b) => {
                if (a.score && b.score) {
                  return b.score - a.score;
                }

                return 0;
              })
              .reduce((acc, c) => {
                const course = courses.find(
                  ({ subject, number }) =>
                    subject.replaceAll(" ", "") === c.subject &&
                    number === c.number
                );

                if (course) return [...acc, course];

                return acc;
              }, [] as ICourse[]),
          };
        });

        setResults(results);
      } catch (error) {
        console.error(error);
      }
    },
    [input, courses]
  );

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
            <Button>
              Search
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
      <div className={styles.body}>
        {results.map((result) => (
          <div key={result.model} className={styles.column}>
            <p>{result.model}</p>
            {result.courses.map((course, index) => (
              <CourseDrawer
                key={index}
                subject={course.subject.replaceAll(" ", "")}
                number={course.number}
              >
                <div className={styles.course}>
                  <p className={styles.title}>
                    {course.subject} {course.number}
                  </p>
                  <p className={styles.description}>{course.title}</p>
                </div>
              </CourseDrawer>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
