/**
 * Formats a time to 12-hour w/ AM PM
 */
export function formatTime(date: Date): string {
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes().toString().padStart(2, "0");
  let ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours || 12;

  let strTime = hours + ':' + minutes + ' ' + ampm;

  return strTime;
}
