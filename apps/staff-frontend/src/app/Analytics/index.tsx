import styles from "./Analytics.module.scss";
import {
  CourseDistributionBlock,
  CourseRatingsDistributionBlock,
  RatingsCountBlock,
  UniqueUsersGrowthBlock,
} from "./components/RatingsAnalytics";
import { SignupHourHistogramBlock, UserGrowthBlock } from "./components/UserAnalytics";

export default function Analytics() {
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.cell}>
          <UserGrowthBlock />
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
          <CourseDistributionBlock />
        </div>
        <div className={styles.cell}>
          <CourseRatingsDistributionBlock />
        </div>
      </div>
    </div>
  );
}
