import { useMemo } from "react";

import classNames from "classnames";
import { ArrowSeparateVertical, ArrowUnionVertical } from "iconoir-react";

import CCN from "@/components/CCN";
import Location from "@/components/Location";
import Time from "@/components/Time";
import Units from "@/components/Units";
import { IClass, ISection } from "@/lib/api";

import styles from "./Class.module.scss";

interface ClassProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  selectedSections: ISection[];
  onSectionSelect: (section: ISection) => void;
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
}: ClassProps & IClass) {
  const kinds = useMemo(
    () => Array.from(new Set(sections.map((section) => section.kind))),
    [sections]
  );

  // Temporary hack to set the class number
  const handleSectionSelect = (section: ISection) => {
    const clonedSection = structuredClone(section);
    clonedSection.class = { number };
    onSectionSelect(clonedSection);
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.disabled]: kinds.length === 0,
      })}
    >
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
              {course.subject} {course.number} {number}
            </p>
            <p className={styles.description}>{title ?? course.title}</p>
            <div className={styles.row}>
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
              <CCN ccn={primarySection.ccn} />
            </div>
          </div>
        </div>
        {expanded &&
          kinds.map((kind) => {
            const sortedSections = sections
              .filter((section) => section.kind === kind)
              .sort((a, b) => a.number.localeCompare(b.number));

            return (
              <div className={styles.group} key={kind}>
                <p className={styles.label}>
                  {kind === "Laboratory" ? "Lab" : kind}s
                </p>
                {sortedSections.map((section) => (
                  <div
                    className={classNames(styles.section, {
                      [styles.active]: selectedSections.find(
                        (selectedSection) => selectedSection.ccn === section.ccn
                      ),
                    })}
                    key={section.ccn}
                    onClick={() => handleSectionSelect(section)}
                  >
                    <div className={styles.radioButton} />
                    <div className={styles.text}>
                      <p className={styles.title}>
                        <span className={styles.important}>
                          {kind === "Laboratory" ? "Lab" : kind}{" "}
                          {section.number}
                        </span>{" "}
                      </p>
                      <CCN ccn={primarySection.ccn} />
                      <Time
                        timeEnd={section.timeEnd}
                        timeStart={section.timeStart}
                        days={section.days}
                      />
                      <Location location={section.location} />
                      {section.instructors &&
                        section.instructors.length > 0 &&
                        `${section.instructors[0].givenName} ${section.instructors[0].familyName}`}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}
