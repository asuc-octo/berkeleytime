import { useMemo } from "react";

import { ArrowSeparateVertical, ArrowUnionVertical } from "iconoir-react";

import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { Component, IClass, ISection, componentMap } from "@/lib/api";
import { getColor } from "@/lib/section";

import styles from "./Class.module.scss";
import Section from "./Section";

interface ClassProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  class: IClass;
  selectedSections: ISection[];
  onSectionSelect: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    number: string
  ) => void;
  onSectionMouseOver: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    number: string
  ) => void;
  onSectionMouseOut: () => void;
}

export default function Class({
  expanded,
  onExpandedChange,
  class: _class,
  selectedSections,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
}: ClassProps) {
  const groups = useMemo(() => {
    const sortedSections = _class.sections.toSorted((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [_class]);

  return (
    <div className={styles.root} data-draggable>
      <div
        className={styles.border}
        style={{
          backgroundColor: getColor(_class.subject, _class.courseNumber),
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
              {_class.subject} {_class.courseNumber}
            </p>
            <p className={styles.description}>
              {_class.title ?? _class.course.title}
            </p>
            <div className={styles.row}>
              {/* <AverageGrade
                gradeDistribution={_class.course.gradeDistribution}
              /> */}
              <Capacity
                enrolledCount={
                  _class.primarySection.enrollment?.latest.enrolledCount
                }
                maxEnroll={_class.primarySection.enrollment?.latest.maxEnroll}
                waitlistedCount={
                  _class.primarySection.enrollment?.latest.waitlistedCount
                }
                maxWaitlist={
                  _class.primarySection.enrollment?.latest.maxWaitlist
                }
              />
              <Units unitsMin={_class.unitsMin} unitsMax={_class.unitsMax} />
            </div>
          </div>
        </div>
        {expanded && (
          <div className={styles.group}>
            <div className={styles.label}>
              <p className={styles.component}>
                {componentMap[_class.primarySection.component]}
              </p>
              <p className={styles.time}>Time</p>
            </div>
            <Section
              active
              {..._class.primarySection}
              onSectionMouseOver={() =>
                onSectionMouseOver(
                  _class.subject,
                  _class.courseNumber,
                  _class.number,
                  _class.primarySection.number
                )
              }
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
                  <p className={styles.component}>{componentMap[group]}</p>
                  <p className={styles.time}>Time</p>
                </div>
                {groups[group]?.map((section) => {
                  const active = selectedSections.some(
                    (selectedSection) =>
                      selectedSection.sectionId === section.sectionId
                  );

                  return (
                    <Section
                      active={active}
                      onSectionMouseOut={onSectionMouseOut}
                      onSectionMouseOver={() =>
                        onSectionMouseOver(
                          _class.subject,
                          _class.courseNumber,
                          _class.number,
                          section.number
                        )
                      }
                      onSectionSelect={() =>
                        onSectionSelect(
                          _class.subject,
                          _class.courseNumber,
                          _class.number,
                          section.number
                        )
                      }
                      {...section}
                      key={section.sectionId}
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
