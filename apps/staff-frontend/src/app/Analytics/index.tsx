import { useState } from "react";
import styles from "./Analytics.module.scss";
import {
  CollectionHighlightsBlock,
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

type Tab = "all" | "general" | "ratings" | "bookmarks" | "gradtrak" | "scheduler";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const showGeneral = activeTab === "all" || activeTab === "general";
  const showRatings = activeTab === "all" || activeTab === "ratings";
  const showBookmarks = activeTab === "all" || activeTab === "bookmarks";

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`${styles.tab} ${activeTab === "general" ? styles.active : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`${styles.tab} ${activeTab === "ratings" ? styles.active : ""}`}
            onClick={() => setActiveTab("ratings")}
          >
            Ratings
          </button>
          <button
            className={`${styles.tab} ${activeTab === "bookmarks" ? styles.active : ""}`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarks
          </button>
          <button
            className={`${styles.tab} ${activeTab === "gradtrak" ? styles.active : ""}`}
            onClick={() => setActiveTab("gradtrak")}
          >
            GradTrak
          </button>
          <button
            className={`${styles.tab} ${activeTab === "scheduler" ? styles.active : ""}`}
            onClick={() => setActiveTab("scheduler")}
          >
            Scheduler
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {showGeneral && (
          <>
            <div className={styles.cell}>
              <UserGrowthBlock />
            </div>
            <div className={styles.cell}>
              <SignupDayHistogramBlock />
            </div>
            <div className={styles.cell}>
              <SignupHourHistogramBlock />
            </div>
          </>
        )}
        {showRatings && (
          <>
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
          </>
        )}
        {showBookmarks && (
          <>
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
            <div className={styles.cell}>
              <CollectionHighlightsBlock />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
