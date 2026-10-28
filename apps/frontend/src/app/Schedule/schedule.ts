import { ISchedule, IScheduleClass } from "@/lib/api";
import { Color, Event, Section } from "@/lib/generated/graphql";

export interface BaseEvent {
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
  return parseInt(hour) * 60 + parseInt(minute);
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
    schedule?.classes.flatMap(
      ({ selectedSections, class: _class, color, hidden }) =>
        hidden
          ? []
          : selectedSections.reduce((acc, section) => {
              const _section =
                _class.primarySection?.sectionId === section.sectionId
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

/**
 * Categorical colors for schedule classes and events.
 * Consecutive entries alternate warm and cool hues so neighboring
 * blocks stay distinguishable. Legacy theme colors are still valid
 * on saved schedules; this list only limits new choices.
 */
export const scheduleClassColors: Color[] = [
  Color.Blue,
  Color.Amber,
  Color.Violet,
  Color.Emerald,
  Color.Rose,
  Color.Cyan,
  Color.Pink,
  Color.Lime,
  Color.Fuchsia,
  Color.Slate,
];

export const acceptedColors = scheduleClassColors;

export const getNextClassColor = (classIndex: number): Color => {
  const colorIndex = classIndex % scheduleClassColors.length;
  return scheduleClassColors[colorIndex];
};
