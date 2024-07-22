import { useMemo } from "react";

import { Plus } from "iconoir-react";

import Button from "@/components/Button";
import Units from "@/components/Units";
import { IClass, ICourse, ISection, Semester } from "@/lib/api";

import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  classes: IClass[];
  selectedSections: ISection[];
  expanded: boolean[];
  onClassSelect: (course: ICourse, number: string) => void;
  onSectionSelect: (section: ISection) => void;
  onSectionMouseOver: (section: ISection) => void;
  onSectionMouseOut: () => void;
  onExpandedChange: (index: number, expanded: boolean) => void;
}

export default function SideBar({
  classes,
  selectedSections,
  onClassSelect,
  expanded,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onExpandedChange,
}: SideBarProps) {
  const [minimum, maximum] = useMemo(
    () =>
      classes.reduce(
        ([minimum, maximum], { unitsMax, unitsMin }) => [
          minimum + unitsMin,
          maximum + unitsMax,
        ],
        [0, 0]
      ),
    [classes]
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.context}>
          <div className={styles.data}>Spring 2024</div>
          <div className={styles.data}>
            {classes.length === 1 ? "1 class" : `${classes.length} classes`},{" "}
            <Units unitsMin={minimum} unitsMax={maximum}>
              {(units) => units}
            </Units>
          </div>
        </div>
        <Catalog
          onClassSelect={onClassSelect}
          semester={Semester.Spring}
          year={2024}
        >
          <Button className={styles.button}>
            Add class
            <Plus />
          </Button>
        </Catalog>
      </div>
      <div className={styles.body}>
        {classes.map((class_, index) => {
          const filteredSections = selectedSections.filter(
            (section) =>
              section.course.number === class_.course.number &&
              section.class.number === class_.number &&
              section.course.subject === class_.course.subject
          );

          return (
            <Class
              key={class_.primarySection.ccn}
              {...class_}
              expanded={expanded[index]}
              onExpandedChange={(expanded) => onExpandedChange(index, expanded)}
              onSectionSelect={onSectionSelect}
              onSectionMouseOver={onSectionMouseOver}
              onSectionMouseOut={onSectionMouseOut}
              selectedSections={filteredSections}
            />
          );
        })}
      </div>
    </div>
  );
}
