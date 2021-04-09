import React, { ReactNode } from 'react';
import { stringToDate } from 'utils/date';
import {
  getCourseForSchedule,
  Schedule,
  SchedulerSectionType,
} from 'utils/scheduler/scheduler';
import CourseCalendar, { CardData } from './CourseCalendar';
import CourseCard from './CourseCard';

/**
 * Converts time to a number representing hour
 * 11:30 => 11.5
 */
function timeToHour(time: string): number {
  const date = stringToDate(time);
  return date.getHours() + date.getMinutes() / 60;
}

/**
 * Convert section object to a card data object
 * WITHOUT the actual
 */
const sectionToCard = (
  section: SchedulerSectionType,
  getCard: (section: SchedulerSectionType, day: number) => ReactNode
): CardData[] =>
  section.days.split('').map((day) => ({
    key: `${day}:${section.id}`,
    day: +day,
    startTime: timeToHour(section.startTime),
    endTime: timeToHour(section.endTime),
    card: getCard(section, +day),
  }));

type Props = {
  schedule: Schedule;

  previewSection?: SchedulerSectionType | null;

  /**
   * If a set schedule function is passed. This will
   * be treated as an editable calendar.
   */
  setSchedule?: (newSchedule: Schedule) => void;
};

/**
 * Outputs the calendar from a schedule object.
 */
const SchedulerCalendar = ({
  schedule,
  setSchedule,
  previewSection = null,
}: Props) => {
  const courseCards = schedule.sections
    .filter((section) => section.startTime && section.endTime)
    .flatMap((section) =>
      sectionToCard(section, () => (
        <CourseCard
          course={getCourseForSchedule(schedule, section)}
          section={section}
          schedule={schedule}
          setSchedule={setSchedule}
        />
      ))
    );

  const previewCards =
    previewSection && !schedule.sections.find((s) => s.id === previewSection.id)
      ? sectionToCard(previewSection, () => (
          <CourseCard
            course={getCourseForSchedule(schedule, previewSection)}
            section={previewSection}
            schedule={schedule}
            isPreview
          />
        ))
      : [];

  const allCards: CardData[] = [...courseCards, ...previewCards];
  return <CourseCalendar cards={allCards} />;
};

export default SchedulerCalendar;
