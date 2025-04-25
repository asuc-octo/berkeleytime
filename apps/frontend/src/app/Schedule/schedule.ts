import { ISchedule, IScheduleEvent, ISection } from "@/lib/api";

interface BaseEvent {
  days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  startTime: string;
  endTime: string;
  id: string;
}

interface SectionEvent extends BaseEvent {
  type: "section";
  section: ISection;
}

interface CustomEvent extends BaseEvent {
  type: "custom";
  event: IScheduleEvent;
}

export type ScheduleEvent = SectionEvent | CustomEvent;

const defaultUnits = [0, 0];

export const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  const hour1 = parseInt(hour, 10);
  const minute1 = parseInt(minute, 10);

  if (isNaN(hour1) || isNaN(minute1)) {
    console.warn("Invalid time string:", time);
    return -1;
  } 
  // need to fix bug --> if time out of bounds, webpage should jump out alarm
  const offset = (hour1 - 6) * 60 + minute1;

  return Math.max(0, Math.min(1079, offset));
};

export const getUnits = (schedule?: ISchedule) => {
  return (schedule?.classes.reduce(
    ([minimum, maximum], { class: { unitsMax, unitsMin } }) => [
      minimum + unitsMin,
      maximum + unitsMax,
    ],
    defaultUnits
  ) ?? defaultUnits) as [minimum: number, maximum: number];
};

export const getSelectedSections = (schedule?: ISchedule) => {
  return (
    schedule?.classes.flatMap(({ selectedSections, class: _class }) =>
      selectedSections.reduce((acc, section) => {
        const _section =
          _class.primarySection.sectionId === section.sectionId
            ? _class.primarySection
            : _class.sections.find(
                (currentSection) =>
                  currentSection.sectionId === section.sectionId
              );

        return _section ? [...acc, _section] : acc;
      }, [] as ISection[])
    ) ?? []
  );
};
