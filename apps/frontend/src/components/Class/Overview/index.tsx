import { useMemo } from "react";

import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";
import { UserSubmittedData } from "./UserSubmittedData";

export default function Overview() {
  const { class: _class } = useClass();
  const prereqs = useMemo(() => {
    if (_class.course.requirements && _class.course.requirements.trim()) {
      return _class.course.requirements;
    }
    const requiredCourses = _class.course.requiredCourses;
    if (requiredCourses == null || requiredCourses.length === 0) {
      return "No Prerequisites Listed.";
    }
    return requiredCourses
      .map((course) => `${course.subject} ${course.number}`)
      .join(", ");
  }, [_class]);
  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {_class.primarySection.meetings.map((meeting, i) => (
            <Details {...meeting} key={i} />
          ))}
          <Flex direction="column" gap="2">
            <p className={styles.label}>Prerequisites</p>
            <p className={styles.description}>{prereqs}</p>
          </Flex>
          <Flex direction="column" gap="2">
            <p className={styles.label}>Description</p>
            <p className={styles.description}>
              {_class.description ?? _class.course.description}
            </p>
          </Flex>
          <UserSubmittedData />
        </Flex>
      </Container>
    </Box>
  );
}
