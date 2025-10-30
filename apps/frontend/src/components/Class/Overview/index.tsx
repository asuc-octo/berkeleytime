import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";
import { UserSubmittedData } from "./UserSubmittedData";
import { useMemo } from "react";

export default function Overview() {
  const { class: _class } = useClass();
  const prereqs = useMemo(() => {
    const requiredCourses = _class.course.requiredCourses;
    if (requiredCourses == null) return "No Prerequisites Listed";
    return requiredCourses.map(course => `${course.subject} ${course.number}`).join(", ");
  }, [_class]);
  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {_class.primarySection.meetings.map((meeting, i) => (
            <Details {...meeting} key={i} />
          ))}
          <Flex direction="column" gap="2">
            <p className={styles.label}>Prerequisites Listed</p>
            <p className={styles.description}>
              {prereqs}
            </p>
          </Flex>
          <Flex direction="column" gap="2">
            <p className={styles.label}>Description</p>
            <p className={styles.description}>
              {_class.description ?? _class.course.description}
            </p>
          </Flex>
          {_class.course.requirements && (
            <Flex direction="column" gap="2">
              <p className={styles.label}>Prerequisites</p>
              <p className={styles.description}>{_class.course.requirements}</p>
            </Flex>
          )}
          <UserSubmittedData />
        </Flex>
      </Container>
    </Box>
  );
}
