import {
  EnrollmentCalendarEventModel,
  TermModel,
  ITermItem,
} from "@repo/common";

import { Config } from "../shared/config";
import { parseEnrollmentEvent } from "./enrollment-calendar-parser";
import { syncEnrollmentTimeframes } from "./enrollment-timeframe";

const ENROLLMENT_CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_lublpqqigfijlbc1l4rudcpi5s%40group.calendar.google.com/public/basic.ics";

type CalendarEvent = {
  uid: string;
  summary: string;
  start: Date | null;
  end: Date | null;
  location?: string;
  description?: string;
  rrule?: string;
  categories?: string[];
  sequence?: number;
  status?: string;
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
  "UTC": 0,
  "GMT": 0,
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
    const novFirstSunday =
      7 - new Date(date.getUTCFullYear(), 10, 1).getDay();

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

function parseICalDate(
  value: string | undefined,
  tzid?: string
): Date | null {
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

function decodeText(value: string | undefined): string | undefined {
  if (!value) return value;
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .trim();
}

type ParsedProperty = {
  value: string;
  params: Record<string, string>;
};

function parsePropertyLine(line: string): { name: string; prop: ParsedProperty } {
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

function parseCategories(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function parseCal(ics: string): CalendarEvent[] {
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
        if (!uid || !summary) {
          inEvent = false;
          current = {};
          continue;
        }

        const dtstart = current["DTSTART"];
        const dtend = current["DTEND"];
        const startTzid = dtstart?.params["TZID"];
        const endTzid = dtend?.params["TZID"];

        const start = parseICalDate(dtstart?.value, startTzid);
        const end = parseICalDate(dtend?.value, endTzid);
        const location = decodeText(current["LOCATION"]?.value);
        const description = decodeText(current["DESCRIPTION"]?.value);
        const rrule = current["RRULE"]?.value;
        const categories = parseCategories(current["CATEGORIES"]?.value);
        const sequenceStr = current["SEQUENCE"]?.value;
        const sequence = sequenceStr ? parseInt(sequenceStr, 10) : undefined;
        const status = current["STATUS"]?.value?.toUpperCase();

        events.push({
          uid,
          summary,
          start,
          end,
          location,
          description,
          rrule,
          categories: categories.length > 0 ? categories : undefined,
          sequence: Number.isNaN(sequence) ? undefined : sequence,
          status:
            status === "CONFIRMED" ||
            status === "TENTATIVE" ||
            status === "CANCELLED"
              ? status
              : undefined,
        });
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

const syncEnrollmentCalendar = async (config: Config) => {
  const { log } = config;
  log.trace(
    `Enrollment calendar collection: ${EnrollmentCalendarEventModel.collection.collectionName}`
  );

  log.trace("Fetching enrollment calendar iCal feed...");
  const iCalContents = await fetchICal();
  const events = parseCal(iCalContents);

  log.info(`Fetched ${events.length} enrollment calendar events.`);

  if (events.length === 0) {
    log.warn(
      "No events returned from the enrollment calendar feed; nothing modified."
    );
    return;
  }

  // Fetch terms for year inference during parsing
  log.trace("Fetching terms for event parsing...");
  const terms = (await TermModel.find({}).lean()) as ITermItem[];
  log.trace(`Loaded ${terms.length} terms for parsing context.`);

  const now = new Date();
  const fetchedUids = new Set<string>();
  let parsedCount = 0;

  const bulkOps = events.map((event) => {
    fetchedUids.add(event.uid);

    // Parse the event to extract structured enrollment data
    const parsedEvent = event.start
      ? parseEnrollmentEvent(event.summary, event.start, terms)
      : null;

    if (parsedEvent) {
      parsedCount++;
    }

    return {
      updateOne: {
        filter: { uid: event.uid },
        update: {
          $set: {
            uid: event.uid,
            summary: event.summary,
            startDate: event.start ?? undefined,
            endDate: event.end ?? undefined,
            location: event.location,
            description: event.description,
            rrule: event.rrule,
            categories: event.categories ?? [],
            sequence: event.sequence,
            status: event.status,
            parsedEvent: parsedEvent,
            source: ENROLLMENT_CALENDAR_URL,
            lastSyncedAt: now,
          },
        },
        upsert: true,
      },
    };
  });

  log.trace("Upserting enrollment calendar events...");
  const bulkResult = await EnrollmentCalendarEventModel.bulkWrite(bulkOps, {
    ordered: false,
  });

  log.info(
    `Upserted events: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated, ${bulkResult.matchedCount} matched.`
  );
  log.info(`Parsed ${parsedCount} enrollment phase events.`);

  log.trace("Removing stale events no longer in feed...");
  const deleteResult = await EnrollmentCalendarEventModel.deleteMany({
    uid: { $nin: Array.from(fetchedUids) },
  });

  if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
    log.info(
      `Removed ${deleteResult.deletedCount.toLocaleString()} stale events.`
    );
  }

  // Automatically sync enrollment timeframes after calendar events are updated
  log.info("Syncing enrollment timeframes...");
  await syncEnrollmentTimeframes(config);
};

export default {
  syncEnrollmentCalendar,
};
