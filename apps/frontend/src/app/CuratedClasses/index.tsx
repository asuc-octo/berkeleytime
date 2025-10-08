import { useMemo } from "react";

import { ArrowUpRight, Calendar, HeartSolid } from "iconoir-react";

import {
  Boundary,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  LoadingIndicator,
} from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";
import { useReadCuratedClasses } from "@/hooks/api";
import { ICuratedClass } from "@/lib/api";

import styles from "./CuratedClasses.module.scss";

export default function CuratedClasses() {
  const { data, loading } = useReadCuratedClasses();

  const semesters = useMemo(
    () =>
      data?.reduce(
        (acc, curatedClass) => {
          const key = `${curatedClass.semester} ${curatedClass.year}`;

          const existingSemester = acc[key];

          if (existingSemester) existingSemester.push(curatedClass);
          else acc[key] = [curatedClass];

          return acc;
        },
        {} as Record<string, ICuratedClass[]>
      ),
    [data]
  );

  if (loading) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  if (semesters) {
    return (
      <Box p="6">
        <Container size="4">
          <Flex gap="5" direction={{ initial: "column-reverse", md: "row" }}>
            <Flex direction="column" gap="5" flexGrow="1">
              {Object.entries(semesters).map(([semester, classes]) => (
                <Flex direction="column" gap="5" key={semester}>
                  <div className={styles.title}>
                    <div className={styles.icon}>
                      <Calendar />
                    </div>
                    {semester}
                  </div>
                  <Grid columns="2" gap="3">
                    {classes.map((curatedClass) => (
                      <ClassDrawer
                        key={curatedClass._id}
                        subject={curatedClass.subject}
                        number={curatedClass.number}
                        courseNumber={curatedClass.courseNumber}
                        year={curatedClass.year}
                        semester={curatedClass.semester}
                      >
                        <Flex direction="column">
                          <div className={styles.cover}>
                            <img
                              src={curatedClass.image}
                              className={styles.image}
                              alt={curatedClass.text}
                            />
                          </div>
                          <ClassCard
                            className={styles.class}
                            class={curatedClass.class}
                          />
                        </Flex>
                      </ClassDrawer>
                    ))}
                  </Grid>
                </Flex>
              ))}
            </Flex>
            <Flex
              direction="column"
              gap="4"
              width={{ md: "320px" }}
              flexShrink="0"
            >
              <div className={styles.icon}>
                <HeartSolid width={32} height={32} />
              </div>
              <Flex direction="column" gap="2">
                <p className={styles.heading}>What are curated classes?</p>
                <p className={styles.description}>
                  Curated classes are hand-picked by the Berkeley Catalog staff
                  in collaboration with professors and departments. These
                  classes are often unique, interesting, or have a special
                  significance that makes them stand out from the rest.
                </p>
              </Flex>
              <Button
                as="a"
                variant="secondary"
                href="https://catalog.berkeley.edu/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Learn more
                <ArrowUpRight />
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>
    );
  }

  return <></>;
}
