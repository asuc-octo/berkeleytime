import { useMemo } from "react";

import { ArrowSeparateVertical, ArrowUnionVertical } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { Component, IClass, ISection, components } from "@/lib/api";
import { getColor } from "@/lib/section";

import styles from "./Class.module.scss";
import Section from "./Section";

interface ClassProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  selectedSections: ISection[];
  onSectionSelect: (section: ISection) => void;
  onSectionMouseOver: (section: ISection) => void;
  onSectionMouseOut: () => void;
}

export default function Class({
  expanded,
  onExpandedChange,
  title,
  course,
  unitsMin,
  unitsMax,
  primarySection,
  sections,
  number,
  selectedSections,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
}: ClassProps & IClass) {
  const groups = useMemo(() => {
    const sortedSections = structuredClone(sections).sort((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [sections]);

  // TODO: Fix temporary hack to set the class number
  const handleSectionSelect = (section: ISection) => {
    const clonedSection = structuredClone(section);

    // @ts-expect-error - Hack to set the class number
    clonedSection.class = { number };

    onSectionSelect(clonedSection);
  };

  const handleSectionMouseOver = (section: ISection) => {
    const clonedSection = structuredClone(section);

    // @ts-expect-error - Hack to set the class number
    clonedSection.class = { number };

    onSectionMouseOver(clonedSection);
  };

  return (
    <div className={styles.root}>
      <div
        className={styles.border}
        style={{
          backgroundColor: getColor(course.subject, course.number),
        }}
      />
      <div className={styles.body}>
        <div
          className={styles.header}
          onClick={() => onExpandedChange(!expanded)}
        >
          <div className={styles.icon}>
            {expanded ? <ArrowUnionVertical /> : <ArrowSeparateVertical />}
          </div>
          <div className={styles.text}>
            <p className={styles.heading}>
              {course.subject} {course.number}
            </p>
            <p className={styles.description}>{title ?? course.title}</p>
            <div className={styles.row}>
              <AverageGrade gradeAverage={course.gradeAverage} />
              <Capacity
                enrollCount={primarySection.enrollCount}
                enrollMax={primarySection.enrollMax}
                waitlistCount={primarySection.waitlistCount}
                waitlistMax={primarySection.waitlistMax}
              />
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
            </div>
          </div>
        </div>
        {expanded && (
          <div className={styles.group}>
            <div className={styles.label}>
              <p className={styles.component}>
                {components[primarySection.component]}
              </p>
              <p className={styles.time}>Time</p>
            </div>
            <Section
              active={selectedSections.some(
                (selectedSection) => selectedSection.ccn === primarySection.ccn
              )}
              {...primarySection}
              onSectionMouseOver={() => handleSectionMouseOver(primarySection)}
              onSectionMouseOut={onSectionMouseOut}
            />
          </div>
        )}
        {expanded &&
          Object.keys(groups).map((component) => {
            const group = component as Component;

            return (
              <div className={styles.group} key={component}>
                <div className={styles.label}>
                  <p className={styles.component}>{components[group]}</p>
                  <p className={styles.time}>Time</p>
                </div>
                {groups[group]?.map((section) => {
                  const active = selectedSections.some(
                    (selectedSection) => selectedSection.ccn === section.ccn
                  );

                  return (
                    <Section
                      active={active}
                      onSectionMouseOut={onSectionMouseOut}
                      onSectionMouseOver={() => handleSectionMouseOver(section)}
                      onSectionSelect={() => handleSectionSelect(section)}
                      {...section}
                      key={section.ccn}
                    />
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}