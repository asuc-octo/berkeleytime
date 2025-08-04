import { Logger } from "tslog";
import ical from "node-ical";
import { fetchCalendarICS } from "./api/calendar";

export interface ICalendarEvent {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

/**
 * Marker shape for enrollment timeline
 */
export interface IEnrollmentMarker {
  periodDescription: string;
  endDate: string; // YYYY-MM-DD, used as x-axis marker (maps to event.start)
}

// Only include events whose summary begins with 'FA25'
const TERM_PREFIX_REGEX = /^FA25\b/i;

/**
 * Fetches the raw ICS text and returns VEVENT entries for the specified term prefix as structured objects.
 */
export async function fetchAllCalendarEvents(
  logger: Logger<unknown>
): Promise<ICalendarEvent[]> {
  logger.info("Fetching calendar ICS and parsing events...");
  const icsText = await fetchCalendarICS(logger);
  logger.info(`Parsing ${icsText.length} characters of ICS data`);

  const parsed = ical.parseICS(icsText);
  const events: ICalendarEvent[] = [];

  for (const key in parsed) {
    const ev = parsed[key];
    if (ev && ev.type === "VEVENT") {
      const summary = ev.summary as string;
      // Only process events for the target term
      if (!TERM_PREFIX_REGEX.test(summary)) continue;

      events.push({
        uid: ev.uid as string,
        summary,
        start: ev.start as Date,
        end: ev.end as Date,
        description: ev.description as string,
      });
    }
  }

  logger.info(`Found ${events.length} events matching prefix 'FA25'`);
  return events;
}

/**
 * Converts calendar events into timeline markers.
 * Uses the event.start date as the marker position (stored in endDate field).
 */
export function mapEventsToMarkers(
  events: ICalendarEvent[]
): IEnrollmentMarker[] {
  return events.map((ev) => ({
    periodDescription: ev.summary,
    endDate: ev.start.toISOString().substring(0, 10),
  }));
}

/**
 * Generic filter by regex on event summary
 */
function filterByRegex(
  events: ICalendarEvent[],
  regex: RegExp
): ICalendarEvent[] {
  return events.filter((ev) => regex.test(ev.summary));
}

/** Convenience filters for phases */
export function filterPhase1Events(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(events, /phase\s*1/i);
}

export function filterPhase2Events(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(events, /phase\s*2/i);
}

export function filterAdjustmentEvents(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(events, /adjustment/i);
}

/** Cohort-specific filters */
export function filterContinuingEvents(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(events, /continuing students?/i);
}

export function filterFreshmanEvents(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(
    events,
    /new undergraduate freshman students?|new freshmen students?/i
  );
}

export function filterTransferEvents(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  return filterByRegex(events, /transfer/i);
}

export function filterGraduateEvents(
  events: ICalendarEvent[]
): ICalendarEvent[] {
  // Match 'graduate' but not 'undergraduate'
  return filterByRegex(events, /(?<!under)graduate/i);
}

/**
 * Fetch and map markers for Phase 1 cohorts
 */
export async function fetchPhase1CohortMarkers(
  logger: Logger<unknown>
): Promise<Record<string, IEnrollmentMarker[]>> {
  const events = await fetchAllCalendarEvents(logger);
  return {
    continuing: mapEventsToMarkers(filterContinuingEvents(filterPhase1Events(events))),
    freshman: mapEventsToMarkers(filterFreshmanEvents(filterPhase1Events(events))),
    transfer: mapEventsToMarkers(filterTransferEvents(filterPhase1Events(events))),
    graduate: mapEventsToMarkers(filterGraduateEvents(filterPhase1Events(events))),
  };
}

/**
 * Fetch and map markers for Phase 2
 */
export async function fetchPhase2Markers(
  logger: Logger<unknown>
): Promise<IEnrollmentMarker[]> {
  const events = filterPhase2Events(await fetchAllCalendarEvents(logger));
  const markers = mapEventsToMarkers(events);
  logger.info(`Extracted ${markers.length} Phase 2 markers`);
  return markers;
}

/**
 * Fetch and map markers for Adjustment Period
 */
export async function fetchAdjustmentMarkers(
  logger: Logger<unknown>
): Promise<IEnrollmentMarker[]> {
  const events = filterAdjustmentEvents(await fetchAllCalendarEvents(logger));
  const markers = mapEventsToMarkers(events);
  logger.info(`Extracted ${markers.length} Adjustment markers`);
  return markers;
}
