import { ISchedule, ISection } from "@/lib/api";

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
          _class.primarySection.sectionId === section
            ? _class.primarySection
            : _class.sections.find(
                (currentSection) => currentSection.sectionId === section
              );

        return _section ? [...acc, _section] : acc;
      }, [] as ISection[])
    ) ?? []
  );
};
