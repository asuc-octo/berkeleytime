import { useCallback, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { ShareIos } from "iconoir-react";

import Button from "@/components/Button";
import MenuItem from "@/components/MenuItem";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_CLASS, ICatalogCourse, IClass, ISection } from "@/lib/api";
import { getY } from "@/lib/schedule";

import Calendar from "./Calendar";
import Map from "./Map";
import styles from "./Schedules.module.scss";
import SideBar from "./SideBar";

export default function Schedules() {
  const apolloClient = useApolloClient();
  const { width } = useWindowDimensions();
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
                selectedSection.kind == section.kind
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
      if (section.timeStart && section.timeEnd) {
        const top = getY(section.timeStart);

        const offset = (getY(section.timeEnd) - top) / 2;

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
    async (course: ICatalogCourse, number: string) => {
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

      // TODO: Fix temporary hack to set the class number
      const clonedPrimarySection = structuredClone(primarySection);
      clonedPrimarySection.class = { number };

      // Add the primary section to selected sections
      setSelectedSections((sections) => [...sections, clonedPrimarySection]);

      const kinds = Array.from(
        new Set(sections.map((section) => section.kind))
      );

      // Add the first section of each kind to selected sections
      for (const kind of kinds) {
        const section = sections
          .filter((section) => section.kind === kind)
          .sort((a, b) => a.number.localeCompare(b.number))[0];

        // TODO: Fix temporary hack to set the class number
        const clonedSection = structuredClone(section);
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
      {width > 992 && (
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
      )}
      <div className={styles.view}>
        <div className={styles.header}>
          <div className={styles.menu}>
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
        <div className={styles.body} ref={bodyRef} id="boundary">
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
