import { Color } from "@repo/theme";

import { ISchedule, IScheduleEvent, ISection } from "@/lib/api";

interface BaseEvent {
  days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  startTime: string;
  endTime: string;
  id: string;
  color: Color;
}

interface SectionEvent extends BaseEvent {
  type: "section";
  section: ISection;
}

interface CustomEvent extends BaseEvent {
  type: "custom";
  event: IScheduleEvent;
}

export interface SectionColor {
  color: Color;
  section: ISection;
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
    schedule?.classes.flatMap(({ selectedSections, class: _class, color }) =>
      selectedSections.reduce((acc, section) => {
        const _section =
          _class.primarySection.sectionId === section.sectionId
            ? _class.primarySection
            : _class.sections.find(
                (currentSection) =>
                  currentSection.sectionId === section.sectionId
              );

        return _section
          ? [
              ...acc,
              {
                section: _section,
                color: color!,
              },
            ]
          : acc;
      }, [] as SectionColor[])
    ) ?? []
  );
};

export const acceptedColors = Object.values(Color);

// DARK_MODE colors from grades mapped to Color enum
const COLOR_ORDER: Color[] = [
  Color.blue,
  Color.green,
  Color.red,
  Color.teal,
  Color.orange,
  Color.emerald,
  Color.sky,
  Color.violet,
];

export const getNextClassColor = (classIndex: number): Color => {
  const colorIndex = classIndex % COLOR_ORDER.length;
  return COLOR_ORDER[colorIndex];
};
