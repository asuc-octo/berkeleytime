/**
 * Formats a time to 12-hour w/ AM PM
 */
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date + 'Z');
  }

  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes().toString().padStart(2, '0');
  let ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours || 12;

  let strTime = hours + ':' + minutes + ' ' + ampm;

  return strTime;
}

/**
 * Converts a numerical string of multiple dates to a human readable string.
 * Prefer to use 'SectionType.wordDays'
 * @example
 * `12` -> `MTu`
 */
export function daysToString(days: string): string {
  return days
    .trim()
    .split('')
    .map((day) => dayToString(+day))
    .join('');
}

/**
 * Converts a 'day' number to a string.
 * @example
 * `1` -> `M`
 * `2` -> `Tu`
 */
export function dayToString(day: number): string {
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
