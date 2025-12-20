import styles from "./Analytics.module.scss";
import {
  CustomCollectionsBlock,
  DailyBookmarksBlock,
  TotalBookmarksBlock,
  UsersWithBookmarksBlock,
  UsersWithCustomCollectionsBlock,
} from "./components/CollectionAnalytics";
import {
  AverageScoresOverTimeBlock,
  CourseDistributionBlock,
  CourseRatingsDistributionBlock,
  RatingsCountBlock,
  RatingsDayHistogramBlock,
  UniqueUsersGrowthBlock,
} from "./components/RatingsAnalytics";
import { SignupDayHistogramBlock, SignupHourHistogramBlock, UserGrowthBlock } from "./components/UserAnalytics";

export default function Analytics() {
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <UserGrowthBlock />
        </div>
        <div className={styles.cell}>
          <SignupDayHistogramBlock />
        </div>
        <div className={styles.cell}>
          <SignupHourHistogramBlock />
        </div>
        <div className={styles.cell}>
          <UniqueUsersGrowthBlock />
        </div>
        <div className={styles.cell}>
          <RatingsCountBlock />
        </div>
        <div className={styles.cell}>
          <RatingsDayHistogramBlock />
        </div>
        <div className={styles.cell}>
          <CourseDistributionBlock />
        </div>
        <div className={styles.cell}>
          <CourseRatingsDistributionBlock />
        </div>
        <div className={styles.cell}>
          <AverageScoresOverTimeBlock />
        </div>
        <div className={styles.cell}>
          <UsersWithBookmarksBlock />
        </div>
        <div className={styles.cell}>
          <TotalBookmarksBlock />
        </div>
        <div className={styles.cell}>
          <DailyBookmarksBlock />
        </div>
        <div className={styles.cell}>
          <CustomCollectionsBlock />
        </div>
        <div className={styles.cell}>
          <UsersWithCustomCollectionsBlock />
        </div>
      </div>
    </div>
  );
}
