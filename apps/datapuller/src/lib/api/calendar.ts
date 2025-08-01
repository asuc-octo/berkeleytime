import { Logger } from "tslog";

/**
 * Berkeley enrollment calendar ICS file
 * Source: https://registrar.berkeley.edu/calendars/enrollment-calendar/
 */
const CALENDAR_URL = 
  "https://calendar.google.com/calendar/ical/c_lublpqqigfijlbc1l4rudcpi5s%40group.calendar.google.com/public/basic.ics";

export async function fetchCalendarICS(
  logger: Logger<unknown>
): Promise<string> {
  try {
    logger.info(`Fetching calendar from: ${CALENDAR_URL}`);
    
    const response = await fetch(CALENDAR_URL);
    
    if (!response.ok) {
      throw new Error(`Calendar fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const icsText = await response.text();
    logger.info(`Successfully fetched calendar (${icsText.length} characters)`);
    
    return icsText;
  } catch (error) {
    logger.error(`Error fetching calendar from ${CALENDAR_URL}:`, error);
    throw error;
  }
}