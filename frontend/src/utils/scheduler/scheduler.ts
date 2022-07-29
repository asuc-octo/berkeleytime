import {
  CourseOverviewFragment,
  CreateScheduleMutationVariables,
  ScheduleFragment,
  SectionFragment,
} from '../../graphql/graphql';
import {
  addUnits,
  parseUnits,
  Units,
  unitsToString,
  ZERO_UNITS,
} from 'utils/courses/units';
import { Semester, semesterToString } from 'utils/playlists/semesters';
import { getNodes } from '../graphql';
import {
  courseToColor,
  courseToName,
  COURSE_PALETTE,
} from 'utils/courses/course';
import { AccessStatus } from './accessStatus';
import { dayToICalDay, reinterpretDateAsUTC, stringToDate } from 'utils/date';
import {
  addWeeks,
  isBefore,
  min,
  nextDay,
  setDay,
  subDays,
  subWeeks,
} from 'date-fns';

// Update the version when the scheduler schema changes.
export const SCHEDULER_LOCALSTORAGE_KEY = 'schedule:save:v1.0';

export type SchedulerCourseType = CourseOverviewFragment;
export type SchedulerSectionType = SectionFragment & {
  /**
   * The ID of the parent course of this seciton
   */
  courseId: string;

  /**
   * If this is a secondary section, the ID of
   * the primary section. If this is undefined,
   * it is a primary section.
   */
  lectureId?: string;
};

export type Schedule = {
  name: string;
  access: AccessStatus;
  courses: SchedulerCourseType[];
  sections: SchedulerSectionType[];
};

export type BackendSchedule = CreateScheduleMutationVariables;

export const DEFAULT_SCHEDULE: Schedule = {
  name: 'My Schedule',
  access: 'private',
  courses: [],
  sections: [],
};

/**
 * Checks if a course is empty
 */
export const isScheduleEmpty = (schedule: Schedule): boolean =>
  !schedule ||
  (schedule.courses.length === 0 && schedule.sections.length === 0);

/**
 * Gets a corresponding course for a section (assuming it exists in the
 * schedule)
 */
export const getCourseForSchedule = (
  schedule: Schedule,
  section: SchedulerSectionType
): SchedulerCourseType | null =>
  schedule.courses.find((c) => c.id === section.courseId) || null;

/**
 * Gets the color for a course (based off a section)
 * within a schedule.
 */
export const getColorForSection = (
  schedule: Schedule,
  section: SchedulerSectionType
): string => getColorForCourse(schedule, section.courseId);

/**
 * Gets the color for a course within a schedule. You
 * can pass the course or course id.
 */
export const getColorForCourse = (
  schedule: Schedule,
  course: CourseOverviewFragment | string
): string =>
  COURSE_PALETTE[
    (schedule.courses.length -
      (schedule.courses.findIndex((c) =>
        typeof course === 'string' ? c.id === course : c.id === course.id
      ) || 0)) %
      COURSE_PALETTE.length
  ];

/**
 * Computes the amount of units in a schedule
 */
export const getUnitsForSchedule = (schedule: Schedule): Units =>
  schedule.courses
    .filter(
      (course) =>
        !!schedule.sections.find((section) => section.courseId === course.id)
    )
    .reduce(
      (sum, course) =>
        course.units ? addUnits(sum, parseUnits(course.units)) : sum,
      ZERO_UNITS
    );

/**
 * Removes a course by id
 */
export const removeCourse = (schedule: Schedule, id: string): Schedule => ({
  ...schedule,
  courses: schedule.courses.filter((c) => c.id !== id),
  sections: schedule.sections.filter((s) => s.courseId !== id),
});

/**
 * Removes a section from the schedule. If a primary section is
 * removed, all associated sections are also removed
 */
export const removeSection = (schedule: Schedule, sectionId: string) => ({
  ...schedule,
  sections: schedule.sections.filter(
    (s) => s.lectureId !== sectionId && s.id !== sectionId
  ),
});

/**
 * Checks if the scheduler has a course by Id
 */
export const hasCourseById = (schedule: Schedule, id: string): boolean =>
  !!schedule.courses.find((c) => c.id === id);

/**
 * Checks if the scheduler has a section by Id
 */
export const hasSectionById = (schedule: Schedule, id: string): boolean =>
  !!schedule.sections.find((c) => c.id === id);

/**
 * Deserializes a schedule from backend to frontend format
 */
export const deserializeSchedule = (schedule: ScheduleFragment): Schedule => ({
  name: schedule.name,
  access: schedule.public ? 'public' : 'private',
  courses: getNodes(schedule.selectedSections).map((section) => section.course),
  sections: getNodes(schedule.selectedSections)
    .flatMap((section) =>
      section.primary
        ? [
            { ...section.primary, courseId: section.course.id },
            ...getNodes(section.secondary).map((secondary) => ({
              courseId: section.course.id,
              lectureId: section.primary!.id,
              ...secondary,
            })),
          ]
        : []
    )
    .filter((n): n is SchedulerSectionType => !!n),
});

/**
 * Converts a schedule from the frontend to backend format
 */
export const serializeSchedule = (
  schedule: Schedule,
  semester: Semester
): BackendSchedule => ({
  name: schedule.name,
  semester: semester.semester,
  year: semester.year,
  public: schedule.access === 'public',
  totalUnits: unitsToString(getUnitsForSchedule(schedule)),
  selectedSections: schedule.courses
    .map((course) => ({
      course: course.id,
      primary: schedule.sections.find(
        (section) => section.courseId === course.id && !section.lectureId
      )?.id,
      secondary: schedule.sections
        .filter(
          (section) => section.courseId === course.id && !!section.lectureId
        )
        .map((section) => section.id),
    }))
    .filter((input) => !!input.primary),
  timeblocks: [],
});

/**
 * Generates iCal file string.
 */
export function scheduleToICal(schedule: Schedule, semester: Semester): string {
  const SEMESTER_START = new Date(2022, 8, 24);
  const LAST_COURSE_DAY = new Date(2022, 12, 16);

  const dateToICal = (date: Date) =>
    date.toISOString().replace(/[-:Z]|\.\d+/g, '');

  const stringToICal = (str: string) =>
    str
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');

  const DTSTAMP = dateToICal(new Date());

  const events = schedule.sections
    .map((section): [SchedulerSectionType, CourseOverviewFragment | null] => [
      section,
      getCourseForSchedule(schedule, section),
    ])
    .filter(([section, course]) => section.days.length >= 1 && course)
    .map(([section]) => {
      const course = getCourseForSchedule(schedule, section)!;
      const courseName = courseToName(course);
      const courseColor = courseToColor(course);

      // To find the first day of the course, we generate all
      // instances of the course for the first two weeks
      const firstWeek = section.days
        .split('')
        .map((day) => setDay(SEMESTER_START, +day as Day));
      const secondWeek = firstWeek.map((day) => addWeeks(day, 1));

      const firstCourseDay = reinterpretDateAsUTC(
        min(
          firstWeek
            .concat(secondWeek)
            .filter((instance) => !isBefore(instance, SEMESTER_START))
        )
      );

      const startTime = stringToDate(section.startTime);
      const endTime = stringToDate(section.endTime);

      const startDateTime = new Date(firstCourseDay);
      startDateTime.setUTCHours(startTime.getUTCHours());
      startDateTime.setUTCMinutes(startTime.getUTCMinutes());

      const endDateTime = new Date(firstCourseDay);
      endDateTime.setUTCHours(endTime.getUTCHours());
      endDateTime.setUTCMinutes(endTime.getUTCMinutes());

      const days = section.days.split('').map((day) => dayToICalDay(+day));

      const name = `${courseName} ${section.kind}`;
      const description = `${courseName}: ${course?.title || 'Unknown Course'}

Instructor: ${section.instructor}
Section CCN: ${section.ccn}

Generated with the Berkeleytime scheduler (https://berkeleytime.com).`;

      return `BEGIN:VEVENT
UID:${section.id}
DTSTAMP:${DTSTAMP}
DTSTART;TZID=America/Los_Angeles:${dateToICal(startDateTime)}
DTEND;TZID=America/Los_Angeles:${dateToICal(endDateTime)}
RRULE:FREQ=WEEKLY;UNTIL=${dateToICal(LAST_COURSE_DAY)};BYDAY=${days}
LOCATION:${stringToICal(section.locationName)}
SUMMARY:${stringToICal(name)}
DESCRIPTION:${stringToICal(description)}
COLOR:${courseColor}
END:VEVENT`;
    });

  const PST_TIMEZONE_SPEC = `BEGIN:VTIMEZONE
TZID:America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;

  return `BEGIN:VCALENDAR
METHOD:PUBLISH
PRODID:-//Berkeleytime.com//Berkeleytime Scheduler 1.0//EN
CALSCALE:GREGORIAN
VERSION:2.0
X-WR-CALNAME: ${schedule.name}
X-WR-CALDESC: Course schedule for ${semesterToString(semester)}
X-WR-TIMEZONE:America/Los_Angeles
${PST_TIMEZONE_SPEC}
${events.join('\n')}
END:VCALENDAR
`
    .split('\n')
    .join('\r\n');
}

/**
 * Formats a schedule error message
 */
export const formatScheduleError = (
  error?: Error | null
): Error | string | null | undefined =>
  error &&
  (error.message.includes('No permission')
    ? 'This schedule is not publicly accessible.'
    : error.message.includes('not a valid UUID') ||
      error.message.includes('Invalid Schedule ID')
    ? 'That schedule does not exist.'
    : 'An error occured loading scheduler information. Please try again later.');
