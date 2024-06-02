import { useCallback, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { ArrowLeft, ShareIos } from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import { GET_CLASS, IClass, ICourse, ISection } from "@/lib/api";
import { getY } from "@/lib/schedule";

import Calendar from "./Calendar";
import Map from "./Map";
import styles from "./Schedule.module.scss";
import SideBar from "./SideBar";

export default function Schedule() {
  const apolloClient = useApolloClient();
  const [tab, setTab] = useState(0);

  // Radix and Floating UI reference the boundary by id
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [classes, setClasses] = useState<IClass[]>([]);
  const [expanded, setExpanded] = useState<boolean[]>([]);

  const [selectedSections, setSelectedSections] = useState<ISection[]>([]);
  const [currentSection, setCurrentSection] = useState<ISection | null>(null);

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
    [setSelectedSections]
  );

  const handleSectionMouseOver = useCallback(
    (section: ISection) => {
      if (tab === 1) return;

      // Jump to the section
      if (section.meetings[0].startTime && section.meetings[0].endTime) {
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
    async (course: ICourse, number: string) => {
      // Fetch the selected class
      const { data } = await apolloClient.query<{ class: IClass }>({
        query: GET_CLASS,
        variables: {
          term: {
            semester: "Spring",
            year: 2024,
          },
          subject: course.subject,
          courseNumber: course.number,
          classNumber: number,
        },
      });

      if (!data) return;

      // Move existing classes to the top rather than duplicating them
      const index = classes.findIndex(
        (class_) =>
          class_.course.subject === course.subject &&
          class_.course.number === course.number &&
          class_.number === number
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

      const { primarySection, sections } = data.class;

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
    [apolloClient, setClasses, classes, setSelectedSections]
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
          <IconButton>
            <ArrowLeft />
          </IconButton>
          <p className={styles.heading}>Untitled Spring 2024 schedule</p>
          <div className={styles.separator} />
        </div>
        <div className={styles.tabs}>
          <MenuItem active={tab === 0} onClick={() => setTab(0)}>
            Schedule
          </MenuItem>
          <MenuItem active={tab === 1} onClick={() => setTab(1)}>
            Itinerary
          </MenuItem>
        </div>
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
