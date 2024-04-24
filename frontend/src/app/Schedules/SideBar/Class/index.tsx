import { useMemo } from "react";

import { ArrowSeparateVertical, ArrowUnionVertical } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass, ISection } from "@/lib/api";
import { kinds } from "@/lib/section";

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
  const groups = useMemo(
    () => Array.from(new Set(sections.map((section) => section.kind))),
    [sections]
  );

  // TODO: Fix temporary hack to set the class number
  const handleSectionSelect = (section: ISection) => {
    const clonedSection = structuredClone(section);
    clonedSection.class = { number };
    onSectionSelect(clonedSection);
  };

  const handleSectionMouseOver = (section: ISection) => {
    const clonedSection = structuredClone(section);
    clonedSection.class = { number };
    onSectionMouseOver(clonedSection);
  };

  return (
    <div className={styles.root}>
      <div className={styles.border} />
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
            <p className={styles.label}>
              {kinds[primarySection.kind]?.name ?? primarySection.kind}
            </p>
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
          groups.map((group) => {
            const sortedSections = sections
              .filter((section) => section.kind === group)
              .sort((a, b) => a.number.localeCompare(b.number));

            return (
              <div className={styles.group} key={group}>
                <p className={styles.label}>{kinds[group]?.name ?? group}</p>
                {sortedSections.map((section) => {
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
