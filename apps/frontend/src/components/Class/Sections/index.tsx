import { useEffect, useMemo, useState } from "react";

import { FrameAltEmpty } from "iconoir-react";

import { Box, Container, PillSwitcher } from "@repo/theme";

import { getEnrollmentColor } from "@/components/Capacity";
import EmptyState from "@/components/Class/EmptyState";
import Time from "@/components/Time";
import { useGetClassSections } from "@/hooks/api/classes/useGetClass";
import useClass from "@/hooks/useClass";
import { componentMap } from "@/lib/api";
import { Component } from "@/lib/generated/graphql";
import { buildings } from "@/lib/location";

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

const getLocationLink = (location?: string) => {
  if (!location) {
    return null;
  }

  const parts = location.trim().split(/\s+/);
  if (parts.length < 2) {
    return null;
  }

  const room = parts.pop();
  const buildingKey = parts.join(" ");
  const building = buildings[buildingKey];

  if (!building?.link || !room) {
    return null;
  }

  return {
    label: `${building.name} ${room}`,
    href: building.link,
  };
};

export default function Sections() {
  const { class: _class } = useClass();
  const { data, loading } = useGetClassSections(
    _class.year,
    _class.semester,
    _class.sessionId,
    _class.subject,
    _class.courseNumber,
    _class.number
  );

  const sections = data?.sections ?? [];

  // Group sections by component type
  const groups = useMemo(() => {
    const sortedSections = sections.toSorted((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [sections]);

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

  if (loading) {
    return <EmptyState heading="Loading Sections Data" loading />;
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<FrameAltEmpty width={32} height={32} />}
        heading="No Associated Sections"
        paragraph={
          <>
            This class doesn&apos;t list any sections yet.
            <br />
            Section details will appear here once they&apos;re available.
          </>
        }
      />
    );
  }

  return (
    <Box p="5">
      <Container size="3">
        <div className={styles.root}>
          <PillSwitcher
            items={tabItems}
            value={activeTab}
            onValueChange={setActiveTab}
          />
          <table className={styles.table}>
            <thead className={styles.header}>
              <tr>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.ccn}`}
                >
                  CCN
                </th>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.number}`}
                >
                  Number
                </th>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.time}`}
                >
                  Time
                </th>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.location}`}
                >
                  Location
                </th>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.waitlist}`}
                >
                  Waitlist
                </th>
                <th
                  scope="col"
                  className={`${styles.headerCell} ${styles.enrolled}`}
                >
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              {activeSections.map((section) => {
                const enrolledCount = section.enrollment?.latest?.enrolledCount;
                const maxEnroll = section.enrollment?.latest?.maxEnroll;
                const waitlistedCount =
                  section.enrollment?.latest?.waitlistedCount;
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
                const locationLink = getLocationLink(locationValue);

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
                  <tr key={section.sectionId} className={styles.row}>
                    <td className={`${styles.cell} ${styles.ccn}`}>
                      {section.sectionId}
                    </td>
                    <td className={`${styles.cell} ${styles.number}`}>
                      {section.number}
                    </td>
                    <td className={`${styles.cell} ${styles.time}`}>
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
                    </td>
                    <td className={`${styles.cell} ${styles.location}`}>
                      {locationLink ? (
                        <a
                          href={locationLink.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={styles.locationLink}
                        >
                          {locationLink.label}
                        </a>
                      ) : (
                        locationValue || NO_DATA_LABEL
                      )}
                    </td>
                    <td className={`${styles.cell} ${styles.waitlist}`}>
                      {typeof waitlistedCount === "number"
                        ? waitlistedCount
                        : NO_DATA_LABEL}
                    </td>
                    <td
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </Box>
  );
}
