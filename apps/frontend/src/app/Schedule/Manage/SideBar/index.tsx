import { useMemo } from "react";

import { Plus } from "iconoir-react";

import { Button } from "@repo/theme";

import Units from "@/components/Units";
import { ISchedule, Semester } from "@/lib/api";

import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  schedule: ISchedule;
  expanded: boolean[];
  onClassSelect: (
    subject: string,
    courseNumber: string,
    number: string
  ) => void;
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
  onExpandedChange: (index: number, expanded: boolean) => void;
}

export default function SideBar({
  schedule,
  onClassSelect,
  expanded,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onExpandedChange,
}: SideBarProps) {
  const [minimum, maximum] = useMemo(
    () =>
      schedule.classes.reduce(
        ([minimum, maximum], { class: { unitsMax, unitsMin } }) => [
          minimum + unitsMin,
          maximum + unitsMax,
        ],
        [0, 0]
      ),
    [schedule]
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.context}>
          <div className={styles.data}>Fall 2024</div>
          <div className={styles.data}>
            {schedule.classes.length === 1
              ? "1 class"
              : `${schedule.classes.length} classes`}
            ,{" "}
            <Units unitsMin={minimum} unitsMax={maximum}>
              {(units) => units}
            </Units>
          </div>
        </div>
        <Catalog
          onClassSelect={onClassSelect}
          semester={Semester.Fall}
          year={2024}
        >
          <Button className={styles.button} variant="solid">
            Add class
            <Plus />
          </Button>
        </Catalog>
      </div>
      <div className={styles.body}>
        {schedule.classes.map((selectedClass, index) => {
          return (
            <Class
              key={selectedClass.class.primarySection.ccn}
              {...selectedClass}
              expanded={expanded[index]}
              onExpandedChange={(expanded) => onExpandedChange(index, expanded)}
              onSectionSelect={onSectionSelect}
              onSectionMouseOver={onSectionMouseOver}
              onSectionMouseOut={onSectionMouseOut}
            />
          );
        })}
      </div>
    </div>
  );
}
