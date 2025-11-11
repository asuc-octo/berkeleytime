import { ISchedule, IScheduleClass } from "@/lib/api";
import { Section, Event, Schedule, Color } from "@/lib/generated/graphql";

interface BaseEvent {
  days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  startTime: string;
  endTime: string;
  id: string;
  color: Color;
}

interface SectionEvent extends BaseEvent {
  type: "section";
  section: Section;
}

interface CustomEvent extends BaseEvent {
  type: "custom";
  event: Event;
}

export interface SectionColor {
  color: Color;
  section: IScheduleClass["class"]["sections"][number];
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
                color: color as Color,
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
  Color.Blue,
  Color.Green,
  Color.Red,
  Color.Teal,
  Color.Orange,
  Color.Emerald,
  Color.Sky,
  Color.Violet,
];

export const getNextClassColor = (classIndex: number): Color => {
  const colorIndex = classIndex % COLOR_ORDER.length;
  return COLOR_ORDER[colorIndex];
};
