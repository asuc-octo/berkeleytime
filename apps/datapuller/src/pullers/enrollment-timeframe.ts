import {
  EnrollmentTimeframeModel,
  TermModel,
  ITermItem,
} from "@repo/common";

import { Config } from "../shared/config";
import {
  parseEnrollmentEvent,
  type Group,
  type ParsedEnrollmentEvent,
  type Semester,
} from "./enrollment-calendar-parser";

// =============================================================================
// iCal Fetching & Parsing
// =============================================================================

const ENROLLMENT_CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_lublpqqigfijlbc1l4rudcpi5s%40group.calendar.google.com/public/basic.ics";

type CalendarEvent = {
  uid: string;
  summary: string;
  start: Date | null;
};

const TIMEZONE_OFFSETS: Record<string, number> = {
  "America/Los_Angeles": -8,
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Phoenix": -7,
  "US/Pacific": -8,
  "US/Eastern": -5,
  "US/Central": -6,
  "US/Mountain": -7,
  UTC: 0,
  GMT: 0,
};

function getTimezoneOffset(tzid: string | undefined, date: Date): number {
  if (!tzid) return 0;

  const baseOffset = TIMEZONE_OFFSETS[tzid];
  if (baseOffset === undefined) {
    console.warn(`Unknown timezone: ${tzid}, treating as UTC`);
    return 0;
  }

  if (tzid.includes("America/") || tzid.startsWith("US/")) {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    const marchSecondSunday =
      14 - new Date(date.getUTCFullYear(), 2, 1).getDay();
    const novFirstSunday = 7 - new Date(date.getUTCFullYear(), 10, 1).getDay();

    const isDST =
      (month > 2 && month < 10) ||
      (month === 2 && day >= marchSecondSunday) ||
      (month === 10 && day < novFirstSunday);

    return isDST ? baseOffset + 1 : baseOffset;
  }

  return baseOffset;
}

async function fetchICal(): Promise<string> {
  const response = await fetch(ENROLLMENT_CALENDAR_URL);
  if (!response.ok) {
    throw new Error(
      `Could not fetch enrollment calendar (${response.status} ${response.statusText})`
    );
  }
  return await response.text();
}

function unfoldLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const unfolded: string[] = [];

  for (const line of lines) {
    if (line.length === 0) continue;
    if (line.startsWith(" ") || line.startsWith("\t")) {
      if (unfolded.length > 0) {
        unfolded[unfolded.length - 1] += line.slice(1);
      }
    } else {
      unfolded.push(line);
    }
  }

  return unfolded;
}

function parseICalDate(value: string | undefined, tzid?: string): Date | null {
  if (!value) return null;
  const s = value.trim();

  if (/^\d{8}$/.test(s)) {
    const year = Number(s.slice(0, 4));
    const month = Number(s.slice(4, 6)) - 1;
    const day = Number(s.slice(6, 8));
    return new Date(Date.UTC(year, month, day));
  }

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(
    s.toUpperCase()
  );
  if (match) {
    const [, year, month, day, hour, minute, second, isUTC] = match;

    if (isUTC) {
      return new Date(
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        )
      );
    }

    const localDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );

    if (tzid) {
      const offsetHours = getTimezoneOffset(tzid, localDate);
      localDate.setUTCHours(localDate.getUTCHours() - offsetHours);
      return localDate;
    }

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  return null;
}

type ParsedProperty = {
  value: string;
  params: Record<string, string>;
};

function parsePropertyLine(line: string): {
  name: string;
  prop: ParsedProperty;
} {
  const colonIndex = line.indexOf(":");
  if (colonIndex === -1) {
    return { name: "", prop: { value: "", params: {} } };
  }

  const left = line.slice(0, colonIndex);
  const value = line.slice(colonIndex + 1);

  const parts = left.split(";");
  const rawName = parts[0].toUpperCase();
  const params: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const eqIndex = parts[i].indexOf("=");
    if (eqIndex !== -1) {
      const paramName = parts[i].slice(0, eqIndex).toUpperCase();
      let paramValue = parts[i].slice(eqIndex + 1);
      if (paramValue.startsWith('"') && paramValue.endsWith('"')) {
        paramValue = paramValue.slice(1, -1);
      }
      params[paramName] = paramValue;
    }
  }

  return { name: rawName, prop: { value, params } };
}

function parseCalendar(ics: string): CalendarEvent[] {
  const lines = unfoldLines(ics);
  const events: CalendarEvent[] = [];

  let inEvent = false;
  let current: Record<string, ParsedProperty> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (inEvent) {
        const uid = current["UID"]?.value;
        const summary = current["SUMMARY"]?.value;
        if (uid && summary) {
          const dtstart = current["DTSTART"];
          const startTzid = dtstart?.params["TZID"];
          const start = parseICalDate(dtstart?.value, startTzid);

          events.push({ uid, summary, start });
        }
      }

      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const { name, prop } = parsePropertyLine(line);
    if (name) {
      current[name] = prop;
    }
  }

  return events;
}

// =============================================================================
// Timeframe Building
// =============================================================================

interface ParsedEventInput {
  uid: string;
  summary: string;
  startDate: Date;
  parsedEvent: ParsedEnrollmentEvent;
}

interface TimeframeKey {
  termCode: string;
  phase: number | null;
  isAdjustment: boolean;
  group: Group;
}

function makeKey(k: TimeframeKey): string {
  return `${k.termCode}|${k.phase ?? "adj"}|${k.isAdjustment}|${k.group}`;
}

/**
 * Groups that should inherit from "new_student" end events
 */
const NEW_STUDENT_GROUPS: Group[] = [
  "new_transfer",
  "new_freshman",
  "new_graduate",
];

/**
 * Build timeframes from parsed enrollment events by pairing start/end events.
 */
function buildTimeframes(
  parsedEvents: ParsedEventInput[],
  termLookup: Map<string, { termId: string }>,
  log: Config["log"]
) {
  // Group events by (termCode, phase, isAdjustment, group, eventType)
  const startEvents = new Map<string, ParsedEventInput>();
  const endEvents = new Map<string, ParsedEventInput>();

  for (const event of parsedEvents) {
    const { parsedEvent } = event;
    const key: TimeframeKey = {
      termCode: parsedEvent.termCode,
      phase: parsedEvent.phase,
      isAdjustment: parsedEvent.isAdjustment,
      group: parsedEvent.group,
    };
    const keyStr = makeKey(key);

    if (parsedEvent.eventType === "start") {
      const existing = startEvents.get(keyStr);
      if (!existing || event.startDate < existing.startDate) {
        startEvents.set(keyStr, event);
      }
    } else {
      const existing = endEvents.get(keyStr);
      if (!existing || event.startDate > existing.startDate) {
        endEvents.set(keyStr, event);
      }
    }
  }

  log.trace(
    `Found ${startEvents.size} unique start events, ${endEvents.size} unique end events.`
  );

  // Build timeframes by matching start and end events
  const timeframes: Array<{
    termId: string;
    year: number;
    semester: Semester;
    phase: number | null;
    isAdjustment: boolean;
    group: Group;
    startDate: Date;
    endDate: Date | undefined;
    startEventUid: string;
    startEventSummary: string;
    endEventUid: string | undefined;
    endEventSummary: string | undefined;
  }> = [];

  for (const [keyStr, startEvent] of startEvents) {
    const { parsedEvent } = startEvent;

    const termInfo = termLookup.get(parsedEvent.termCode);
    if (!termInfo) {
      log.warn(
        `No term found for termCode ${parsedEvent.termCode}, skipping timeframe.`
      );
      continue;
    }

    // Find matching end event
    let endEvent = endEvents.get(keyStr);

    // If no direct end event and this is a new student group, try "new_student" end
    if (
      !endEvent &&
      NEW_STUDENT_GROUPS.includes(parsedEvent.group) &&
      !parsedEvent.isAdjustment
    ) {
      const newStudentKey: TimeframeKey = {
        termCode: parsedEvent.termCode,
        phase: parsedEvent.phase,
        isAdjustment: false,
        group: "new_student",
      };
      endEvent = endEvents.get(makeKey(newStudentKey));
    }

    // Also try "all" as a fallback for end events
    if (!endEvent) {
      const allKey: TimeframeKey = {
        termCode: parsedEvent.termCode,
        phase: parsedEvent.phase,
        isAdjustment: parsedEvent.isAdjustment,
        group: "all",
      };
      endEvent = endEvents.get(makeKey(allKey));
    }

    timeframes.push({
      termId: termInfo.termId,
      year: parsedEvent.year,
      semester: parsedEvent.semester,
      phase: parsedEvent.phase,
      isAdjustment: parsedEvent.isAdjustment,
      group: parsedEvent.group,
      startDate: startEvent.startDate,
      endDate: endEvent?.startDate,
      startEventUid: startEvent.uid,
      startEventSummary: startEvent.summary,
      endEventUid: endEvent?.uid,
      endEventSummary: endEvent?.summary,
    });
  }

  return timeframes;
}

// =============================================================================
// Main Sync Function
// =============================================================================

/**
 * Sync enrollment timeframes from the UC Berkeley enrollment calendar.
 * Fetches the iCal feed, parses enrollment events, and upserts timeframes.
 */
const syncEnrollmentTimeframe = async (config: Config) => {
  const { log } = config;

  log.trace(
    `Enrollment timeframe collection: ${EnrollmentTimeframeModel.collection.collectionName}`
  );

  // Fetch and parse iCal
  log.trace("Fetching enrollment calendar iCal feed...");
  const iCalContents = await fetchICal();
  const calendarEvents = parseCalendar(iCalContents);

  log.info(`Fetched ${calendarEvents.length} calendar events.`);

  if (calendarEvents.length === 0) {
    log.warn("No events returned from the enrollment calendar feed.");
    return;
  }

  // Fetch terms for year inference and termId lookup
  log.trace("Fetching terms...");
  const terms = (await TermModel.find({}).lean()) as ITermItem[];
  log.trace(`Loaded ${terms.length} terms.`);

  // Build termCode -> termId lookup
  const termLookup = new Map<string, { termId: string }>();
  for (const term of terms) {
    const nameParts = term.name.split(" ");
    if (nameParts.length >= 2) {
      const year = parseInt(nameParts[0], 10);
      const semester = nameParts[1];
      if (!isNaN(year) && semester) {
        const yearShort = year % 100;
        const prefix =
          semester === "Spring" ? "SP" : semester === "Fall" ? "FA" : "SU";
        const termCode = `${prefix}${yearShort.toString().padStart(2, "0")}`;
        termLookup.set(termCode, { termId: term.id });
      }
    }
  }

  // Parse calendar events into enrollment events
  const parsedEvents: ParsedEventInput[] = [];
  for (const event of calendarEvents) {
    if (!event.start) continue;

    const parsedEvent = parseEnrollmentEvent(event.summary, event.start, terms);
    if (parsedEvent) {
      parsedEvents.push({
        uid: event.uid,
        summary: event.summary,
        startDate: event.start,
        parsedEvent,
      });
    }
  }

  log.info(
    `Parsed ${parsedEvents.length} enrollment events from ${calendarEvents.length} calendar events.`
  );

  if (parsedEvents.length === 0) {
    log.warn("No enrollment events parsed; nothing to aggregate.");
    return;
  }

  // Build timeframes from parsed events
  const timeframes = buildTimeframes(parsedEvents, termLookup, log);

  log.info(`Built ${timeframes.length} enrollment timeframes.`);

  if (timeframes.length === 0) {
    log.warn("No timeframes built; nothing to upsert.");
    return;
  }

  // Upsert timeframes
  const now = new Date();
  const bulkOps = timeframes.map((tf) => ({
    updateOne: {
      filter: {
        termId: tf.termId,
        phase: tf.phase,
        isAdjustment: tf.isAdjustment,
        group: tf.group,
      },
      update: {
        $set: {
          termId: tf.termId,
          year: tf.year,
          semester: tf.semester,
          phase: tf.phase,
          isAdjustment: tf.isAdjustment,
          group: tf.group,
          startDate: tf.startDate,
          endDate: tf.endDate,
          startEventUid: tf.startEventUid,
          startEventSummary: tf.startEventSummary,
          endEventUid: tf.endEventUid,
          endEventSummary: tf.endEventSummary,
          lastSyncedAt: now,
        },
      },
      upsert: true,
    },
  }));

  log.trace("Upserting enrollment timeframes...");
  const bulkResult = await EnrollmentTimeframeModel.bulkWrite(bulkOps, {
    ordered: false,
  });

  log.info(
    `Upserted timeframes: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated, ${bulkResult.matchedCount} matched.`
  );

  // Remove stale timeframes
  const validKeys = new Set(
    timeframes.map(
      (tf) => `${tf.termId}|${tf.phase}|${tf.isAdjustment}|${tf.group}`
    )
  );

  const allTimeframes = await EnrollmentTimeframeModel.find({}).lean();
  const staleIds = allTimeframes
    .filter((tf) => {
      const key = `${tf.termId}|${tf.phase}|${tf.isAdjustment}|${tf.group}`;
      return !validKeys.has(key);
    })
    .map((tf) => tf._id);

  if (staleIds.length > 0) {
    log.trace("Removing stale timeframes...");
    const deleteResult = await EnrollmentTimeframeModel.deleteMany({
      _id: { $in: staleIds },
    });
    log.info(`Removed ${deleteResult.deletedCount} stale timeframes.`);
  }
};

export default {
  syncEnrollmentTimeframe,
};
