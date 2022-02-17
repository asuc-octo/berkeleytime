import { CalendarOptions, ICalendar, ICSPropertyValue } from 'datebook';
import { floorMod } from './number';

/**
 * Converts time string to date
 */
export function stringToDate(time: string): Date {
  return new Date(`${time}Z`);
}

/**
 * Formats a time to 12-hour w/ AM PM
 */
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = stringToDate(date);
  }

  // Sorry internationals but timezones r weird so this is go
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes().toString().padStart(2, '0');
  let ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours || 12;

  let strTime = hours + ':' + minutes + ampm;

  return strTime;
}

/**
 * Converts a numerical string of multiple dates to a human readable string.
 * Prefer to use 'SectionType.wordDays'
 * @example
 * `12` -> `MTu`
 */
export function daysToString(
  days: string,
  convertor: (day: number) => string = dayToShortName
): string {
  return days
    .trim()
    .split('')
    .map((day) => convertor(+day))
    .join('');
}

/**
 * Converts a 'day' number to a string.
 * @example
 * `1` -> `M`
 * `2` -> `Tu`
 */
export function dayToShortName(day: number): string {
  switch (day) {
    case 7:
    case 0:
      return 'Sun';
    case 1:
      return 'M';
    case 2:
      return 'Tu';
    case 3:
      return 'W';
    case 4:
      return 'Th';
    case 5:
      return 'F';
    case 6:
      return 'Sat';
    default:
      return `${day}`;
  }
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const ICAL_DAY_NAMES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Converts numerical day of the week to day. e.g. 0 => Sunday.
 */
export function dayToLongName(day: number): string {
  return DAY_NAMES[day];
}

/**
 * Converts day to iCal number
 */
export const dayToICalDay = (day: number): string => ICAL_DAY_NAMES[day];

/**
 * Converts a 'time' e.g. 13 into a time "1 PM"
 */
export function timeToHourString(time: number): string {
  const floorModTime = ((time % 24) + 24) % 24;

  if (time < 12) {
    return `${floorModTime}am`;
  } else if (time == 12) {
    return `12pm`;
  } else {
    return `${floorModTime % 12}pm`;
  }
}

/**
 * Re-interprets a local date as a UTC date.
 */
export const reinterpretDateAsUTC = (date: Date) =>
  new Date(date.getTime() + new Date().getTimezoneOffset() * 60 * 1000);

type ICalOptions = CalendarOptions & {
  metadata?: { [key: string]: string };
  property?: { [key: string]: ICSPropertyValue };
};

/**
 * Creates ICalendar from dates
 */
export function createICalendar(events: ICalOptions[]): ICalendar | null {
  function createEvent(event: ICalOptions): ICalendar {
    const calendar = new ICalendar(event);
    for (const [key, value] of Object.entries(event.metadata || {})) {
      calendar.setMeta(key, value);
    }
    for (const [key, value] of Object.entries(event.property || {})) {
      calendar.addProperty(key, value);
    }
    return calendar;
  }

  if (events.length === 0) return null;
  const calendar = createEvent(events[0]);
  for (let i = 1; i < events.length; i++) {
    calendar.addEvent(createEvent(events[i]));
  }
  return calendar;
}
