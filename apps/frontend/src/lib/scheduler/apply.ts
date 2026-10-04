import { IScheduleClass } from "@/lib/api";

export interface GeneratedSelection {
  subject: string;
  courseNumber: string;
  number: string;
  sectionIds: string[];
}

/**
 * Applies generated section choices to a schedule's classes. Only the
 * selected sections of generated classes change; hidden classes and every
 * color, lock and excluded section stay as they were.
 */
export const applyGeneratedSelection = (
  classes: IScheduleClass[],
  generated: GeneratedSelection[]
): IScheduleClass[] =>
  classes.map((scheduleClass) => {
    const { subject, courseNumber, number, primarySection, sections } =
      scheduleClass.class;

    const match = generated.find(
      (selection) =>
        selection.subject === subject &&
        selection.courseNumber === courseNumber &&
        selection.number === number
    );

    if (!match) return scheduleClass;

    const available = [primarySection, ...sections];

    return {
      ...scheduleClass,
      selectedSections: match.sectionIds.flatMap((sectionId) => {
        const section = available.find(
          (candidate) =>
            candidate && String(candidate.sectionId) === String(sectionId)
        );
        return section ? [section] : [];
      }),
    };
  });
