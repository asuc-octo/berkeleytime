import { parseTime } from "@/lib/schedule/conflict";

import { GeneratorMeeting, GeneratorSection } from "./types";

/** One meeting on one day, in minutes after midnight. Day 0 is Monday. */
export interface Interval {
  day: number;
  start: number;
  end: number;
}

/** Inclusive range of days since 1970-01-01 in which a section meets. */
export interface DateRange {
  first: number;
  last: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const FULL_TERM: DateRange = { first: -Infinity, last: Infinity };

/**
 * Berkeley lists a class that runs 10:10-11:00 as 10:00-10:59. Rounding an
 * end time that falls on :x9 up one minute makes back-to-back classes touch,
 * so they don't show up as one-minute gaps. Overlap results do not change.
 */
export const roundListedEnd = (end: number) => (end % 10 === 9 ? end + 1 : end);

const toMinutes = (time?: string | null) => {
  if (!time) return null;
  const minutes = parseTime(time);
  return Number.isFinite(minutes) ? minutes : null;
};

const expand = (
  meetings: GeneratorMeeting[],
  midnightIsUnannounced: boolean
): Interval[] =>
  meetings.flatMap(({ days, startTime, endTime }) => {
    const start = toMinutes(startTime);
    const listedEnd = toMinutes(endTime);
    if (start === null || listedEnd === null || listedEnd <= start) return [];
    if (start === 0 && midnightIsUnannounced) return [];

    const end = roundListedEnd(listedEnd);
    return (days ?? []).flatMap((meets, day) =>
      meets ? [{ day, start, end }] : []
    );
  });

/**
 * Expands section meetings into one interval per meeting day. Meetings
 * without a usable time are skipped: SIS marks a time that has not been
 * announced with a 00:00 start.
 */
export const toIntervals = (meetings: GeneratorMeeting[]): Interval[] =>
  expand(meetings, true);

/**
 * Expands the student's busy times. Unlike a section, an event that starts
 * at 00:00 really does start at midnight.
 */
export const toBusyIntervals = (events: GeneratorMeeting[]): Interval[] =>
  expand(events, false);

const toDay = (date?: string | null) => {
  if (!date) return null;
  const time = Date.parse(date);
  return Number.isFinite(time) ? Math.floor(time / DAY_MS) : null;
};

/** The weeks a section runs; missing dates mean the whole term. */
export const toDateRange = (section: GeneratorSection): DateRange => ({
  first: toDay(section.startDate) ?? FULL_TERM.first,
  last: toDay(section.endDate) ?? FULL_TERM.last,
});

export const rangesOverlap = (a: DateRange, b: DateRange) =>
  a.first <= b.last && b.first <= a.last;

export const intervalsOverlap = (a: Interval[], b: Interval[]) =>
  a.some((x) =>
    b.some((y) => x.day === y.day && x.start < y.end && y.start < x.end)
  );
