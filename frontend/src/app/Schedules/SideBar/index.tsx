import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { useApolloClient } from "@apollo/client";

import Button from "@/components/Button";
import { GET_CLASS, ICatalogCourse, IClass, ISection } from "@/lib/api";

import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  classes: IClass[];
  setClasses: Dispatch<SetStateAction<IClass[]>>;
  selectedSections: ISection[];
  setSelectedSections: Dispatch<SetStateAction<ISection[]>>;
}

export default function SideBar({
  classes,
  setClasses,
  selectedSections,
  setSelectedSections,
}: SideBarProps) {
  const apolloClient = useApolloClient();
  const [expandedClasses, setExpandedClasses] = useState<boolean[]>([]);

  const handleSectionSelect = useCallback(
    (section: ISection) => {
      setSelectedSections((selectedSections) => {
        const index = selectedSections.findIndex(
          (selectedSection) =>
            selectedSection.course.subject === section.course.subject &&
            selectedSection.course.number === section.course.number &&
            selectedSection.class.number === section.class.number &&
            selectedSection.number === section.number
        );

        if (index !== -1) return selectedSections;

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

  const handleCourseSelect = useCallback(
    async (course: ICatalogCourse, number: string) => {
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

      const index = classes.findIndex(
        (_class) =>
          _class.course.subject === course.subject &&
          _class.course.number === course.number &&
          _class.number === number
      );

      setExpandedClasses((expandedClasses) => {
        const _expandedClasses = structuredClone(expandedClasses);
        if (index !== -1) _expandedClasses.splice(index, 1);
        return [true, ...expandedClasses];
      });

      setClasses((classes) => {
        const _classes = structuredClone(classes);
        if (index !== -1) _classes.splice(index, 1);
        return [data.class, ...classes];
      });

      if (index !== -1) return;

      const { primarySection, sections } = data.class;

      // Temporary hack to set the class number
      const clonedPrimarySection = structuredClone(primarySection);
      clonedPrimarySection.class = { number };

      setSelectedSections((sections) => [...sections, clonedPrimarySection]);

      const kinds = Array.from(
        new Set(sections.map((section) => section.kind))
      );

      for (const kind of kinds) {
        const section = sections
          .filter((section) => section.kind === kind)
          .sort((a, b) => a.number.localeCompare(b.number))[0];

        // Temporary hack to set the class number
        const clonedSection = structuredClone(section);
        clonedSection.class = { number };

        setSelectedSections((sections) => [...sections, clonedSection]);
      }
    },
    [apolloClient, setClasses, classes, setSelectedSections]
  );

  const setExpanded = (index: number, expanded: boolean) => {
    setExpandedClasses((expandedClasses) => {
      const _expandedClasses = structuredClone(expandedClasses);
      _expandedClasses[index] = expanded;
      return _expandedClasses;
    });
  };

  return (
    <div className={styles.root}>
      <Catalog
        onCourseSelect={handleCourseSelect}
        semester="Spring"
        year={2024}
      >
        <Button>Add class</Button>
      </Catalog>
      {classes.map((_class, index) => {
        const filteredSections = selectedSections.filter(
          (section) =>
            section.course.number === _class.course.number &&
            section.class.number === _class.number &&
            section.course.subject === _class.course.subject
        );

        return (
          <Class
            key={`${_class.course.subject} ${_class.course.number} ${_class.number}`}
            {..._class}
            expanded={expandedClasses[index]}
            onExpandedChange={(expanded) => setExpanded(index, expanded)}
            onSectionSelect={(section) => handleSectionSelect(section)}
            selectedSections={filteredSections}
          />
        );
      })}
    </div>
  );
}
