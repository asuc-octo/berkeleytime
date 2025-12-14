import { useEffect, useMemo, useRef } from "react";

import { Plus } from "iconoir-react";

import { Button } from "@repo/theme";

import Units from "@/components/Units";
import useSchedule from "@/hooks/useSchedule";
import { IScheduleClass, IScheduleEvent } from "@/lib/api";
import { Color, Component } from "@/lib/generated/graphql";

import { getUnits } from "../../schedule";
import EventDialog from "../EventDialog";
import Catalog from "./Catalog";
import Class from "./Class";
import Event from "./Event";
import styles from "./SideBar.module.scss";

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
  onLockChange: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    locked: boolean
  ) => void;
  onHideChange: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    hidden: boolean
  ) => void;
  onSectionBlockToggle: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    sectionId: number,
    blocked: boolean
  ) => void;
  onComponentBlockToggle: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    component: Component,
    blocked: boolean
  ) => void;
  onComponentLockChange: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    component: Component,
    locked: boolean
  ) => void;
  onEventColorChange: (id: string, color: Color) => void;
  onEventTitleChange: (id: string, title: string) => void;
  onEventHideChange: (id: string, hidden: boolean) => void;
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
  onLockChange,
  onHideChange,
  onSectionBlockToggle,
  onComponentBlockToggle,
  onComponentLockChange,
  onEventColorChange,
  onEventTitleChange,
  onEventHideChange,
}: SideBarProps) {
  const { schedule, editing } = useSchedule();

  const bodyRef = useRef<HTMLDivElement>(null);

  const [minimum, maximum] = useMemo(() => getUnits(schedule), [schedule]);

  useEffect(() => {
    if (!bodyRef.current) return;

    // TODO: Fix sorting

    // const sortable = new Sortable(bodyRef.current, {
    //   draggable: `[data-draggable]`,
    //   distance: 8,
    //   mirror: {
    //     constrainDimensions: true,
    //   },
    //   plugins: [Plugins.ResizeMirror],
    // });

    // // sortable.on("drag:stop", (event) => {
    // //   event.cancel();
    // // });

    // sortable.on("sortable:stop", (event) => {
    //   const { oldIndex, newIndex } = event;
    //   console.log(oldIndex, newIndex);
    //   onSortEnd(oldIndex, newIndex);
    // });

    // return () => {
    //   sortable.destroy();
    // };
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
              onHideChange={(hidden) => {
                onEventHideChange(event._id, hidden);
              }}
            />
          );
        })}
        {schedule.classes.map((selectedClass, index) => {
          return (
            <Class
              key={`${selectedClass.class.subject}${selectedClass.class.courseNumber}${selectedClass.class.number}`}
              class={selectedClass.class}
              selectedSections={selectedClass.selectedSections}
              semester={schedule.semester}
              year={schedule.year}
              color={selectedClass.color!}
              hidden={selectedClass.hidden ?? false}
              locked={selectedClass.locked ?? false}
              blockedSections={selectedClass.blockedSections}
              lockedComponents={selectedClass.lockedComponents ?? []}
              expanded={expanded[index] ?? false}
              onExpandedChange={(expanded) => onExpandedChange(index, expanded)}
              onSectionSelect={onSectionSelect}
              onSectionMouseOver={onSectionMouseOver}
              onSectionMouseOut={onSectionMouseOut}
              onDelete={onDeleteClass}
              onColorChange={onColorChange}
              onLockChange={onLockChange}
              onHideChange={onHideChange}
              onSectionBlockToggle={onSectionBlockToggle}
              onComponentBlockToggle={onComponentBlockToggle}
              onComponentLockChange={onComponentLockChange}
            />
          );
        })}
      </div>
    </div>
  );
}
