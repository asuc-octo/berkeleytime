import { useEffect, useMemo, useRef } from "react";

import { Plugins, Sortable } from "@shopify/draggable";
import { Plus } from "iconoir-react";

import { Button } from "@repo/theme";

import Units from "@/components/Units";
import useSchedule from "@/hooks/useSchedule";
import { IClass, IScheduleClass, IScheduleEvent } from "@/lib/api";

import { getUnits } from "../../schedule";
import EventDialog from "../EventDialog";
import Catalog from "./Catalog";
import Class from "./Class";
import Event from "./Event";
import styles from "./SideBar.module.scss";
import { Color } from "@/lib/generated/graphql";

interface SideBarProps {
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
  onDeleteClass: (cls: IScheduleClass["class"]) => void;
  onDeleteEvent: (event: IScheduleEvent) => void;
  onColorChange: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    color: Color
  ) => void;
  onEventColorChange: (id: string, color: Color) => void;
  onEventTitleChange: (id: string, title: string) => void;
}

export default function SideBar({
  onClassSelect,
  expanded,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onExpandedChange,
  onSortEnd,
  onDeleteClass,
  onDeleteEvent,
  onColorChange,
  onEventColorChange,
  onEventTitleChange,
}: SideBarProps) {
  const { schedule, editing } = useSchedule();

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
          <div className={styles.data}>
            {schedule.semester} {schedule.year}
          </div>
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
        {editing && (
          <Catalog
            onClassSelect={onClassSelect}
            semester={schedule.semester}
            year={schedule.year}
          >
            <Button className={styles.button}>
              Add class
              <Plus />
            </Button>
          </Catalog>
        )}
        {editing && (
          <EventDialog>
            <Button className={styles.button}>
              Add event
              <Plus />
            </Button>
          </EventDialog>
        )}
      </div>
      <div className={styles.body} ref={bodyRef}>
        {schedule.events?.map((event, index) => {
          return (
            <Event
              key={index}
              event={event}
              onDelete={onDeleteEvent}
              onColorSelect={(c) => {
                onEventColorChange(event._id, c);
              }}
              onEventTitleChange={onEventTitleChange}
            />
          );
        })}
        {schedule.classes.map((selectedClass, index) => {
          return (
            <Class
              key={`${selectedClass.class.subject}${selectedClass.class.courseNumber}${selectedClass.class.number}`}
              {...selectedClass}
              semester={schedule.semester}
              year={schedule.year}
              color={selectedClass.color!}
              expanded={expanded[index] ?? false}
              onExpandedChange={(expanded) => onExpandedChange(index, expanded)}
              onSectionSelect={onSectionSelect}
              onSectionMouseOver={onSectionMouseOver}
              onSectionMouseOut={onSectionMouseOut}
              onDelete={onDeleteClass}
              onColorChange={onColorChange}
            />
          );
        })}
      </div>
    </div>
  );
}
