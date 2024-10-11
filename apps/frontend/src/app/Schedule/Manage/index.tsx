import { useCallback, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import {
  ArrowLeft,
  Copy,
  Settings,
  ShareIos,
  ViewColumns2,
} from "iconoir-react";
import { Link, useOutletContext } from "react-router-dom";

import { Button, IconButton, MenuItem, Tooltip } from "@repo/theme";

import Week from "@/components/Week";
import { GET_CLASS, IClass, ISection } from "@/lib/api";
import { getY } from "@/lib/schedule";

import { ScheduleContextType } from "../schedule";
import Calendar from "./Calendar";
import styles from "./Manage.module.scss";
import Map from "./Map";
import SideBar from "./SideBar";

export default function Manage() {
  const {
    selectedSections,
    setSelectedSections,
    classes,
    setClasses,
    expanded,
    setExpanded,
  } = useOutletContext<ScheduleContextType>();

  const [currentSection, setCurrentSection] = useState<ISection | null>(null);
  const apolloClient = useApolloClient();
  const [tab, setTab] = useState(0);

  // Radix and Floating UI reference the boundary by id
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const handleSectionSelect = useCallback(
    (section: ISection) => {
      // Clear the current section
      setCurrentSection(null);

      setSelectedSections((selectedSections) => {
        // Ignore selected sections
        const ignored = selectedSections.some(
          (selectedSection) => selectedSection.ccn === section.ccn
        );

        if (ignored) return selectedSections;

        return [
          ...selectedSections.filter(
            (selectedSection) =>
              !(
                selectedSection.course.subject === section.course.subject &&
                selectedSection.course.number === section.course.number &&
                selectedSection.class.number === section.class.number &&
                selectedSection.component == section.component
              )
          ),
          section,
        ];
      });
    },
    [setSelectedSections, setCurrentSection]
  );

  const handleSectionMouseOver = useCallback(
    (section: ISection) => {
      // Jump to the section
      if (
        tab === 0 &&
        section.meetings[0].startTime &&
        section.meetings[0].endTime
      ) {
        const top = getY(section.meetings[0].startTime);

        const offset = (getY(section.meetings[0].endTime) - top) / 2;

        bodyRef.current?.scrollTo({
          top: top + offset - bodyRef.current.clientHeight / 2,
          behavior: "smooth",
        });
      }

      // Ignore selected sections
      if (
        selectedSections.some(
          (selectedSection) => selectedSection.ccn === section.ccn
        )
      )
        return;

      setCurrentSection(section);
    },
    [setCurrentSection, selectedSections, tab]
  );

  const handleClassSelect = useCallback(
    async (selectedClass: IClass) => {
      // Fetch the selected class
      const { data } = await apolloClient.query<{ class: IClass }>({
        query: GET_CLASS,
        variables: {
          term: {
            semester: "Fall",
            year: 2024,
          },
          subject: selectedClass.course.subject,
          courseNumber: selectedClass.course.number,
          classNumber: selectedClass.number,
        },
      });

      if (!data) return;

      // Move existing classes to the top rather than duplicating them
      const index = classes.findIndex(
        ({ course, number }) =>
          course.subject === selectedClass.course.subject &&
          course.number === selectedClass.course.number &&
          number === selectedClass.number
      );

      setExpanded((expandedClasses) => {
        const _expandedClasses = structuredClone(expandedClasses);
        if (index !== -1) _expandedClasses.splice(index, 1);
        return [true, ...expandedClasses];
      });

      setClasses((classes) => {
        const _classes = structuredClone(classes);
        if (index !== -1) _classes.splice(index, 1);
        return [data.class, ...classes];
      });

      // Add new classes to the top expanded
      if (index !== -1) return;

      const { primarySection, sections, number } = data.class;

      const clonedPrimarySection = structuredClone(primarySection);

      // @ts-expect-error - Hack to set the class number
      clonedPrimarySection.class = { number };

      // Add the primary section to selected sections
      setSelectedSections((sections) => [...sections, clonedPrimarySection]);

      const kinds = Array.from(
        new Set(sections.map((section) => section.component))
      );

      // Add the first section of each kind to selected sections
      for (const kind of kinds) {
        const section = sections
          .filter((section) => section.component === kind)
          .sort((a, b) => a.number.localeCompare(b.number))[0];

        const clonedSection = structuredClone(section);

        // @ts-expect-error - Hack to set the class number
        clonedSection.class = { number };

        setSelectedSections((sections) => [...sections, clonedSection]);
      }
    },
    [apolloClient, setClasses, classes, setSelectedSections, setExpanded]
  );

  const handleExpandedChange = (index: number, expanded: boolean) => {
    setExpanded((expandedClasses) => {
      const _expandedClasses = structuredClone(expandedClasses);
      _expandedClasses[index] = expanded;
      return _expandedClasses;
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <Tooltip content="Back to schedules">
            <Link to="../schedules">
              <IconButton>
                <ArrowLeft />
              </IconButton>
            </Link>
          </Tooltip>
          <p className={styles.heading}>Untitled Fall 2024 schedule</p>
          <Tooltip content="Settings">
            <IconButton>
              <Settings />
            </IconButton>
          </Tooltip>
          <div className={styles.separator} />
        </div>
        <div className={styles.tabs}>
          <MenuItem active={tab === 0} onClick={() => setTab(0)}>
            Schedule
          </MenuItem>
          <MenuItem active={tab === 1} onClick={() => setTab(1)}>
            Calendar
          </MenuItem>
          <MenuItem active={tab === 2} onClick={() => setTab(2)}>
            Map
          </MenuItem>
        </div>
        <Link to="compare">
          <Button variant="outline">
            <ViewColumns2 />
            Compare
          </Button>
        </Link>
        <Button variant="outline">
          <Copy />
          Clone
        </Button>
        <Button>
          Share
          <ShareIos />
        </Button>
      </div>
      <div className={styles.body}>
        <SideBar
          classes={classes}
          selectedSections={selectedSections}
          expanded={expanded}
          onClassSelect={handleClassSelect}
          onSectionSelect={handleSectionSelect}
          onExpandedChange={handleExpandedChange}
          onSectionMouseOver={handleSectionMouseOver}
          onSectionMouseOut={() => setCurrentSection(null)}
        />
        <div className={styles.view} ref={bodyRef} id="boundary">
          {tab === 0 ? (
            <Week
              selectedSections={selectedSections}
              currentSection={currentSection}
            />
          ) : tab === 1 ? (
            <Calendar
              selectedSections={selectedSections}
              currentSection={currentSection}
            />
          ) : (
            <Map selectedSections={selectedSections} />
          )}
        </div>
      </div>
    </div>
  );
}
