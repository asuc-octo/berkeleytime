import { useEffect, useMemo, useRef } from "react";

import { Plugins, Sortable } from "@shopify/draggable";
import { Plus } from "iconoir-react";

import { Button } from "@repo/theme";

import Units from "@/components/Units";
import { ISchedule, Semester } from "@/lib/api";

import { getUnits } from "../../schedule";
import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  schedule: ISchedule;
  expanded: boolean[];
  onSortEnd: (previousIndex: number, currentIndex: number) => void;
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
  onSortEnd,
}: SideBarProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const [minimum, maximum] = useMemo(() => getUnits(schedule), [schedule]);

  useEffect(() => {
    if (!bodyRef.current) return;

    const sortable = new Sortable(bodyRef.current, {
      draggable: `[data-draggable]`,
      distance: 8,
      mirror: {
        constrainDimensions: true,
      },
      plugins: [Plugins.ResizeMirror],
    });

    sortable.on("drag:stop", (event) => {
      event.cancel();
    });

    sortable.on("sortable:stop", (event) => {
      const { oldIndex, newIndex } = event;

      onSortEnd(oldIndex, newIndex);
    });

    return () => {
      sortable.destroy();
    };
  }, [onSortEnd]);

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
      <div className={styles.body} ref={bodyRef}>
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