import { useEffect, useMemo, useState } from "react";

import { FrameAltEmpty } from "iconoir-react";

import { PillSwitcher } from "@repo/theme";

import { getEnrollmentColor } from "@/components/Capacity";
import Time from "@/components/Time";
import useClass from "@/hooks/useClass";
import { componentMap } from "@/lib/api";
import { Component } from "@/lib/generated/graphql";

import styles from "./Sections.module.scss";

const NO_DATA_LABEL = "No Data";

const hasValidStartTime = (time?: string | null) => {
  if (!time) {
    return false;
  }

  const [hoursPart] = time.split(":");
  const hours = Number.parseInt(hoursPart ?? "", 10);

  return Number.isFinite(hours) && hours > 0;
};

export default function Sections() {
  const { class: _class } = useClass();

  // Group sections by component type
  const groups = useMemo(() => {
    const sortedSections = _class.sections.toSorted((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [_class]);

  // Generate tab items from available component types
  const tabItems = useMemo(() => {
    return Object.keys(groups).map((component) => ({
      value: component,
      label: componentMap[component as Component],
    }));
  }, [groups]);

  const [activeTab, setActiveTab] = useState(tabItems[0]?.value || "");

  // Get sections for the active tab
  const activeSections = groups[activeTab as Component] || [];

  useEffect(() => {
    if (!tabItems.find((tab) => tab.value === activeTab)) {
      setActiveTab(tabItems[0]?.value || "");
    }
  }, [tabItems, activeTab]);

  if (_class.sections.length === 0) {
    return (
      <div className={styles.placeholder}>
        <FrameAltEmpty width={32} height={32} />
        <p className={styles.heading}>No Associated Sections</p>
        <p className={styles.paragraph}>
          This class doesn&apos;t list any sections yet.
          <br />
          Section details will appear here once they&apos;re available.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <PillSwitcher
        items={tabItems}
        value={activeTab}
        onValueChange={setActiveTab}
      />
      <div className={styles.table}>
        {/* Table Header */}
        <div className={styles.header}>
          <p className={`${styles.headerCell} ${styles.ccn}`}>CCN</p>
          <p className={`${styles.headerCell} ${styles.time}`}>Time</p>
          <p className={`${styles.headerCell} ${styles.location}`}>Location</p>
          <p className={`${styles.headerCell} ${styles.waitlist}`}>Waitlist</p>
          <p className={`${styles.headerCell} ${styles.enrolled}`}>Enrolled</p>
        </div>

        {/* Table Rows */}
        {activeSections.map((section) => {
          const enrolledCount = section.enrollment?.latest?.enrolledCount;
          const maxEnroll = section.enrollment?.latest?.maxEnroll;
          const waitlistedCount = section.enrollment?.latest?.waitlistedCount;
          const firstMeeting = section.meetings[0];
          const hasTimeData = Boolean(
            firstMeeting?.days?.some((day) => day) &&
              firstMeeting?.endTime &&
              hasValidStartTime(firstMeeting?.startTime)
          );
          const locationValue =
            typeof firstMeeting?.location === "string"
              ? firstMeeting.location.trim()
              : "";

          // Calculate enrollment percentage
          const enrollmentPercentage =
            typeof enrolledCount === "number" &&
            typeof maxEnroll === "number" &&
            maxEnroll > 0
              ? Math.round((enrolledCount / maxEnroll) * 100)
              : null;

          const enrollmentColor = getEnrollmentColor(enrolledCount, maxEnroll);

          return (
            <div key={section.sectionId} className={styles.row}>
              <p className={`${styles.cell} ${styles.ccn}`}>
                {section.sectionId}
              </p>
              <div className={`${styles.cell} ${styles.time}`}>
                {hasTimeData ? (
                  <Time
                    days={firstMeeting?.days}
                    startTime={firstMeeting?.startTime}
                    endTime={firstMeeting?.endTime}
                    className={styles.timeText}
                  />
                ) : (
                  NO_DATA_LABEL
                )}
              </div>
              <p className={`${styles.cell} ${styles.location}`}>
                {locationValue || NO_DATA_LABEL}
              </p>
              <p className={`${styles.cell} ${styles.waitlist}`}>
                {typeof waitlistedCount === "number"
                  ? waitlistedCount
                  : NO_DATA_LABEL}
              </p>
              <p
                className={`${styles.cell} ${styles.enrolled}`}
                style={
                  enrollmentPercentage !== null
                    ? { color: enrollmentColor }
                    : undefined
                }
              >
                {enrollmentPercentage !== null
                  ? `${enrollmentPercentage}% enrolled`
                  : NO_DATA_LABEL}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
