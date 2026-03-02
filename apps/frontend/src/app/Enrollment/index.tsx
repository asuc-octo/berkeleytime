import { useEffect, useState } from "react";

import CourseSelect, { CourseOption } from "@/components/CourseSelect";
import CourseSelectionCard from "@/components/CourseSelectionCard";
import {
  CourseAnalyticsCardGrid,
  CourseAnalyticsField,
  CourseAnalyticsLayout,
  CourseAnalyticsSidebar,
} from "@/components/CourseAnalytics/CourseAnalyticsLayout";
import { useCourseAnalyticsIsDesktop } from "@/components/CourseAnalytics/CourseAnalyticsLayout/useCourseAnalyticsIsDesktop";

import styles from "./Enrollment.module.scss";

interface EnrollmentSidebarProps {
  selectedCourse: CourseOption | null;
  onSelectCourse: (course: CourseOption) => void;
  onClearCourse: () => void;
}

function EnrollmentSidebar({
  selectedCourse,
  onSelectCourse,
  onClearCourse,
}: EnrollmentSidebarProps) {
  return (
    <CourseAnalyticsSidebar title="Enrollment">
      <CourseAnalyticsField label="Class">
        <CourseSelect
          selectedCourse={selectedCourse}
          onSelect={onSelectCourse}
          onClear={onClearCourse}
        />
      </CourseAnalyticsField>
    </CourseAnalyticsSidebar>
  );
}

export default function Enrollment() {
  const isDesktop = useCourseAnalyticsIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);

  useEffect(() => {
    if (isDesktop || selectedCourse) return;
    setDrawerOpen(true);
  }, [isDesktop, selectedCourse]);

  return (
    <CourseAnalyticsLayout
      isDesktop={isDesktop}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      sidebar={
        <EnrollmentSidebar
          selectedCourse={selectedCourse}
          onSelectCourse={setSelectedCourse}
          onClearCourse={() => setSelectedCourse(null)}
        />
      }
    >
      <div className={styles.outputList}>
        <CourseAnalyticsCardGrid>
          {selectedCourse ? (
            <CourseSelectionCard
              color="var(--blue-500)"
              subject={selectedCourse.subject}
              number={selectedCourse.number}
              metadata="Enrollment preview"
              loadGradeDistribution={false}
              fluid
            />
          ) : (
            <div className={styles.emptyState}>
              Select a class to preview the enrollment layout.
            </div>
          )}
        </CourseAnalyticsCardGrid>
      </div>

      <div className={styles.graphPlaceholder}>Enrollment graph placeholder</div>
    </CourseAnalyticsLayout>
  );
}
