import { useMemo, useState } from "react";

import { FrameAltEmpty } from "iconoir-react";
import { Tabs } from "radix-ui";

import { PillSwitcher } from "@repo/theme";

import { getEnrollmentColor } from "@/components/Capacity";
import Time from "@/components/Time";
import useClass from "@/hooks/useClass";
import { componentMap } from "@/lib/api";
import { Component } from "@/lib/generated/graphql";

import styles from "./Sections.module.scss";

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

  if (_class.sections.length === 0) {
    return (
      <div className={styles.placeholder}>
        <FrameAltEmpty width={32} height={32} />
        <p className={styles.heading}>No associated sections</p>
        <p className={styles.paragraph}>
          Please refer to the class syllabus or instructor for the most accurate
          information regarding class attendance requirements.
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

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        {tabItems.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value} className={styles.content}>
            <div className={styles.table}>
              {/* Table Header */}
              <div className={styles.header}>
                <p className={styles.headerCell} style={{ width: "44px" }}>
                  CNN
                </p>
                <p className={styles.headerCell} style={{ width: "138px" }}>
                  Time
                </p>
                <p className={styles.headerCell} style={{ width: "62px" }}>
                  Location
                </p>
                <p className={styles.headerCell}>Waitlist</p>
                <p className={styles.headerCell} style={{ width: "87px" }}>
                  Enrolled
                </p>
              </div>

              {/* Table Rows */}
              {groups[tab.value as Component]?.map((section) => {
                const enrolledCount = section.enrollment?.latest?.enrolledCount;
                const maxEnroll = section.enrollment?.latest?.maxEnroll;
                const waitlistedCount =
                  section.enrollment?.latest?.waitlistedCount || 0;

                // Calculate enrollment percentage
                const enrollmentPercentage =
                  typeof enrolledCount === "number" &&
                  typeof maxEnroll === "number" &&
                  maxEnroll > 0
                    ? Math.round((enrolledCount / maxEnroll) * 100)
                    : null;

                const enrollmentColor = getEnrollmentColor(
                  enrolledCount,
                  maxEnroll
                );

                return (
                  <div key={section.sectionId} className={styles.row}>
                    <p className={styles.cell} style={{ width: "44px" }}>
                      {section.sectionId}
                    </p>
                    <p className={styles.cell} style={{ width: "138px" }}>
                      {section.meetings[0] ? (
                        <Time
                          days={section.meetings[0].days}
                          startTime={section.meetings[0].startTime}
                          endTime={section.meetings[0].endTime}
                        />
                      ) : (
                        "—"
                      )}
                    </p>
                    <p className={styles.cell}>
                      {section.meetings[0]?.location || "—"}
                    </p>
                    <p className={styles.cell} style={{ width: "50px" }}>
                      {waitlistedCount}
                    </p>
                    <div className={styles.enrollment}>
                      {enrollmentPercentage !== null ? (
                        <p style={{ color: enrollmentColor }}>
                          {enrollmentPercentage}% enrolled
                        </p>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}
