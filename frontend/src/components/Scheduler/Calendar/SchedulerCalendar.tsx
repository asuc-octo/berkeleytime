import React from 'react';
import { courseToColor, courseToName } from 'utils/courses/course';
import { stringToDate } from 'utils/date';
import { getCourseForSchedule, Schedule } from 'utils/scheduler/scheduler';
import { formatLocation, formatSectionTime } from 'utils/sections/section';
import CalendarCard from './CalendarCard';
import CourseCalendar from './CourseCalendar';

/**
 * Converts time to a number representing hour
 * 11:30 => 11.5
 */
function timeToHour(time: string): number {
  const date = stringToDate(time);
  return date.getUTCHours() + date.getUTCMinutes() / 60;
}

type Props = {
  schedule: Schedule;
};

/**
 * Outputs the calendar from a schedule object.
 */
const SchedulerCalendar = ({ schedule }: Props) => {

  const cards = schedule.sections
    .filter((section) => section.startTime && section.endTime)
    .flatMap((section) =>
      section.days.split('').map((day) => ({
        key: `${day}:${section.id}`,
        day: +day,
        startTime: timeToHour(section.startTime),
        endTime: timeToHour(section.endTime),
        card: (
          <CalendarCard
            title={`${courseToName(getCourseForSchedule(schedule, section))} ${section.kind}`}
            description={[
              formatSectionTime(section),
              formatLocation(section.locationName),
            ]
              .filter(Boolean)
              .join(', ')}
            color={courseToColor(section.courseId)}
          />
        ),
      }))
    );

  return <CourseCalendar cards={cards} />;
};

export default SchedulerCalendar;
