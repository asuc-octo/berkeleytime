import { ReactNode } from "react";

import { Box, Flex } from "@repo/theme";

import styles from "./CourseAnalyticsPage.module.scss";

interface CourseAnalyticsPageProps {
  courseInput: ReactNode;
  courseCards: ReactNode;
  chart: ReactNode;
  hoverInfo: ReactNode;
}

export function CourseAnalyticsPage({
  courseInput,
  courseCards,
  chart,
  hoverInfo,
}: CourseAnalyticsPageProps) {
  return (
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <Flex direction="column" gap="4">
          {courseInput}
          <Flex wrap="wrap" gap="12px">
            {courseCards}
          </Flex>
        </Flex>
        <div className={styles.content}>
          {chart}
          <div className={styles.hoverInfoContainer}>
            <div className={styles.hoverInfoCard}>{hoverInfo}</div>
          </div>
        </div>
      </Flex>
    </Box>
  );
}
