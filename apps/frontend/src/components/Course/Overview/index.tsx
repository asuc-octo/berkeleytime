import { Flex } from "@repo/theme";

import useCourse from "@/hooks/useCourse";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { course } = useCourse();

  return (
    <Flex direction="column" p="5">
      <p className={styles.label}>Description</p>
      <p className={styles.description}>{course.description}</p>
    </Flex>
  );
}
