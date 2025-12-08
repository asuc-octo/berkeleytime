import classNames from "classnames";
import { ArrowRight } from "iconoir-react";
import { Link } from "react-router-dom";

import {
  Box,
  Breakpoint,
  Container,
  Flex,
  useBreakpointMatch,
} from "@repo/theme";

import styles from "./Features.module.scss";
import calendar from "./calendar.png";
import course from "./course.png";
import courses from "./courses.png";
import enrollment1 from "./enrollment-1.png";
import enrollment2 from "./enrollment-2.png";
import filters from "./filters.png";
import grades1 from "./grades-1.png";
import grades2 from "./grades-2.png";
import graph1 from "./graph-1.png";
import graph2 from "./graph-2.png";
import schedule from "./schedule.png";

export default function Features() {
  const breakpointMatch = useBreakpointMatch(Breakpoint.Large);

  return (
    <Box px="5" py="9" style={{ backgroundColor: "var(--background-color)" }}>
      <Container>
        <Flex direction="column" gap="9">
          <Flex direction={{ initial: "column", lg: "row" }} gap="9">
            {breakpointMatch && (
              <div className={styles.gallery}>
                <img
                  src={calendar}
                  className={classNames(styles.image, styles.calendar)}
                />
                <img
                  src={schedule}
                  className={classNames(styles.image, styles.schedule)}
                />
              </div>
            )}
            <Flex
              direction="column"
              width={{ lg: "512px" }}
              flexShrink="0"
              py={{ lg: "192px" }}
            >
              <h3 className={styles.heading}>Simple schedule planning</h3>
              <p className={styles.description}>
                Plan, save, and share schedules. An alternative to CalCentral,
                Berkeleytime makes scheduling your semester easy and
                user-friendly.
              </p>
              <Link to="/schedules" className={styles.link}>
                Start planning
                <ArrowRight />
              </Link>
            </Flex>
          </Flex>
          <Flex direction={{ initial: "column", lg: "row" }} gap="9">
            {breakpointMatch && (
              <div className={styles.gallery}>
                <img
                  src={filters}
                  className={classNames(styles.image, styles.filters)}
                />
                <img
                  src={courses}
                  className={classNames(styles.image, styles.courses)}
                />
                <img
                  src={course}
                  className={classNames(styles.image, styles.course)}
                />
              </div>
            )}
            <Flex
              direction="column"
              width={{ lg: "512px" }}
              flexShrink="0"
              py={{ lg: "192px" }}
            >
              <h3 className={styles.heading}>Find the right classes for you</h3>
              <p className={styles.description}>
                Instead of spending hours sifting through courses on the
                Berkeley course catalog, instantly filter and sort courses by
                average grade, number of open seats, and more.
              </p>
              <Link to="/catalog" className={styles.link}>
                Browse courses
                <ArrowRight />
              </Link>
            </Flex>
          </Flex>
          <Flex direction={{ initial: "column", lg: "row" }} gap="9">
            {breakpointMatch && (
              <div className={styles.gallery}>
                <img
                  src={graph2}
                  className={classNames(styles.image, styles.graph)}
                />
                <img
                  src={grades1}
                  className={classNames(styles.image, styles.grades1)}
                />
                <img
                  src={grades2}
                  className={classNames(styles.image, styles.grades2)}
                />
              </div>
            )}
            <Flex
              direction="column"
              width={{ lg: "512px" }}
              flexShrink="0"
              py={{ lg: "192px" }}
            >
              <h3 className={styles.heading}>Get ahead of the curve</h3>
              <p className={styles.description}>
                View grade distributions for classes based on the semester and
                professor. Stop worrying about the A, and make informed
                decisions about your schedule.
              </p>
              <Link to="/grades" className={styles.link}>
                Go to Grades
                <ArrowRight />
              </Link>
            </Flex>
          </Flex>
          <Flex direction={{ initial: "column", lg: "row" }} gap="9">
            {breakpointMatch && (
              <div className={styles.gallery}>
                <img
                  src={graph1}
                  className={classNames(styles.image, styles.graph)}
                />
                <img
                  src={enrollment1}
                  className={classNames(styles.image, styles.enrollment1)}
                />
                <img
                  src={enrollment2}
                  className={classNames(styles.image, styles.enrollment2)}
                />
              </div>
            )}
            <Flex
              direction="column"
              width={{ lg: "512px" }}
              py={{ lg: "192px" }}
              flexShrink="0"
            >
              <h3 className={styles.heading}>Secure your seat</h3>
              <p className={styles.description}>
                Track enrollment for courses and sections in real-time. View
                enrollment history over time and know when to enroll, and when
                you can wait.
              </p>
              <Link to="/enrollment" className={styles.link}>
                Go to Enrollment
                <ArrowRight />
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
