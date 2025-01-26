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
  return (parseInt(hour) - 6) * 60 + parseInt(minute);
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
          _class.primarySection.ccn === section
            ? _class.primarySection
            : _class.sections.find(
                (currentSection) => currentSection.ccn === section
              );

        return _section ? [...acc, _section] : acc;
      }, [] as ISection[])
    ) ?? []
  );
};
