import { EnrollmentCalendarEventModel } from "@repo/common";

import { Config } from "../shared/config";

const ENROLLMENT_CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_lublpqqigfijlbc1l4rudcpi5s%40group.calendar.google.com/public/basic.ics";

type CalendarEvent = {
  uid: string;
  summary: string;
  start: Date | null;
  end: Date | null;
  location?: string;
  description?: string;
};

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

function parseICalDate(value: string | undefined): Date | null {
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
    const utcDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );
    if (isUTC) {
      return utcDate;
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

function parseCal(ics: string): CalendarEvent[] {
  const lines = unfoldLines(ics);
  const events: CalendarEvent[] = [];

  let inEvent = false;
  let current: Record<string, string> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (inEvent) {
        const uid = current["UID"];
        const summary = current["SUMMARY"];
        if (!uid || !summary) {
          inEvent = false;
          current = {};
          continue;
        }

        const start = parseICalDate(current["DTSTART"]);
        const end = parseICalDate(current["DTEND"]);
        const location = decodeText(current["LOCATION"]);
        const description = decodeText(current["DESCRIPTION"]);

        events.push({ uid, summary, start, end, location, description });
      }

      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const [left, value = ""] = line.split(":", 2);
    const [rawName] = left.split(";", 1);
    const name = rawName.toUpperCase();
    current[name] = value;
  }

  return events;
}

const syncEnrollmentCalendar = async ({ log }: Config) => {
  log.trace(
    `Enrollment calendar collection: ${EnrollmentCalendarEventModel.collection.collectionName}`
  );

  log.trace("Fetching enrollment calendar iCal feed...");
  const iCalContents = await fetchICal();
  const events = parseCal(iCalContents);

  log.info(`Fetched ${events.length} enrollment calendar events.`);

  log.trace("Clearing existing enrollment calendar entries...");
  const { deletedCount } = await EnrollmentCalendarEventModel.deleteMany({});
  log.info(`Deleted ${deletedCount?.toLocaleString() ?? 0} existing events.`);

  if (events.length === 0) {
    log.warn(
      "No events returned from the enrollment calendar feed; nothing inserted."
    );
    return;
  }

  const now = new Date();
  const documents = events.map((event) => ({
    uid: event.uid,
    summary: event.summary,
    startDate: event.start ?? undefined,
    endDate: event.end ?? undefined,
    location: event.location,
    description: event.description,
    source: ENROLLMENT_CALENDAR_URL,
    lastSyncedAt: now,
  }));

  const inserted = await EnrollmentCalendarEventModel.insertMany(documents, {
    ordered: false,
  });
  log.info(
    `Inserted ${inserted.length.toLocaleString()} enrollment calendar events.`
  );
};

export default {
  syncEnrollmentCalendar,
};
