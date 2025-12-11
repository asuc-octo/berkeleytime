import { ReactNode } from "react";

import { Box, Flex } from "@repo/theme";

import styles from "./CourseAnalyticsPage.module.scss";

interface CourseAnalyticsPageProps {
  courseInput: ReactNode;
  courseCards: ReactNode;
  chart: ReactNode;
  dataBoard: ReactNode;
  bottomTitle?: string;
  bottomDescription?: ReactNode;
}

export function CourseAnalyticsPage({
  courseInput,
  courseCards,
  chart,
  dataBoard,
  bottomTitle,
  bottomDescription,
}: CourseAnalyticsPageProps) {
  return (
    <Box p="5" className={styles.root}>
      <Flex direction="column">
        <Flex direction="column" gap="4">
          {courseInput}
          <Flex wrap="wrap" gap="12px" className={styles.courseCards}>
            {courseCards}
          </Flex>
        </Flex>
        <div className={styles.content}>
          <div className={styles.chartAndDataBoard}>
            {chart}
            <div className={styles.dataBoardContainer}>
              <div className={styles.dataBoard}>{dataBoard}</div>
            </div>
          </div>
          {(bottomTitle || bottomDescription) && (
            <div className={styles.bottomComponent}>
              {bottomTitle && (
                <div className={styles.bottomTitle}>{bottomTitle}</div>
              )}
              {bottomDescription && (
                <div className={styles.bottomDescription}>
                  {bottomDescription}
                </div>
              )}
            </div>
          )}
        </div>
      </Flex>
    </Box>
  );
}
