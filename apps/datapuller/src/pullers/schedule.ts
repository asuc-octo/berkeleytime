type CalendarEvent = {
  uid: string;
  summary: string;
  start: Date | null;
  end: Date | null;
  location?: string | undefined;
  description?: string | undefined;
};

async function fetchICal(): Promise<string> {
  const iCal_URL = "https://calendar.google.com/calendar/ical/c_lublpqqigfijlbc1l4rudcpi5s%40group.calendar.google.com/public/basic.ics";
  const res = await fetch(iCal_URL);
  if (!res.ok) {
    throw new Error(`Could not fetch iCal(${res.status} ${res.statusText})`);
  }
  return await res.text();
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
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(4, 6)) - 1;
  const day = Number(s.slice(6, 8));
  return new Date(year, month, day);
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
        const uid = current["UID"] ?? "";
        const summary = current["SUMMARY"] ?? "";
        const start = parseICalDate(current["DTSTART"]);
        const end = parseICalDate(current["DTEND"]);
        const location = current["LOCATION"];
        const description = current["DESCRIPTION"];

        events.push({ uid, summary, start, end, location, description });
      }
      inEvent = false;
      current = {};
      continue;
    }
    if (!inEvent) continue;

    // KEY;PARAM:VALUE, param optional
    const [left, value = ""] = line.split(":", 2);
    const [rawName] = left.split(";", 1);
    const name = rawName.toUpperCase();
    current[name] = value;
  }

  return events;
}

const allSchedules = async () => {
  const iCal = await fetchICal();
  const events = parseCal(iCal);
  return events;
};

export default {
  allSchedules,
};