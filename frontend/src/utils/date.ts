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
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? ' PM' : ' AM';

  hours = hours % 12;
  hours = hours || 12;

  const strTime = hours + ':' + minutes + ampm;

  return strTime;
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
  } else if (time === 12) {
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
