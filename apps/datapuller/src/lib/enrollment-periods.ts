import ical from "node-ical";
import { Logger } from "tslog";
import { fetchCalendarICS } from "./api/calendar";

export type TimePeriodEntry = {
  semester: string;
  timePeriods: {
    periodDescription: string;
    endDate: string;          // ISO "YYYY-MM-DD"
  }[];
};

/**
 * Fetches the public .ics, parses it, and returns one entry per semester
 * with an array of your Phase 1/Phase 2/Adjustment dates.
 */
export async function getEnrollmentTimePeriods(
  logger: Logger<unknown>
): Promise<TimePeriodEntry[]> {
  const icsText = await fetchCalendarICS(logger);

  const data = ical.parseICS(icsText);

  const map = new Map<string, TimePeriodEntry["timePeriods"]>();

  for (const key in data) {
    const ev = data[key];
    if (ev.type !== "VEVENT" || !ev.summary) continue;

    // Only care about Phase 1 / Phase 2 / Adjustment
    if (!/Phase ?1|Phase ?2|Adjustment/i.test(ev.summary)) continue;

    // Determine semester label from date
    const dt = new Date(ev.start as string | Date);
    const sem = dt.getMonth() < 6 ? "Spring" : "Fall";
    const label = `${sem} ${dt.getFullYear()}`;

    // Prepare the slot
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push({
      periodDescription: ev.summary,
      endDate: dt.toISOString().split("T")[0],
    });
  }

  return Array.from(map.entries()).map(([semester, timePeriods]) => ({
    semester,
    timePeriods,
  }));
}
