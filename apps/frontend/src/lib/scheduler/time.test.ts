import { describe, expect, it } from "vitest";

import {
  rangesOverlap,
  roundListedEnd,
  toDateRange,
  toIntervals,
} from "./time";

describe("roundListedEnd", () => {
  it("rounds Berkeley-time ends up to the next ten minutes", () => {
    expect(roundListedEnd(10 * 60 + 59)).toBe(11 * 60);
    expect(roundListedEnd(14 * 60 + 29)).toBe(14 * 60 + 30);
    expect(roundListedEnd(10 * 60 + 50)).toBe(10 * 60 + 50);
  });
});

describe("toIntervals", () => {
  it("expands a meeting into one interval per day", () => {
    expect(
      toIntervals([
        {
          days: [true, false, true, false, false, false, false],
          startTime: "10:00:00",
          endTime: "10:59:00",
        },
      ])
    ).toEqual([
      { day: 0, start: 600, end: 660 },
      { day: 2, start: 600, end: 660 },
    ]);
  });

  it("skips meetings whose time is not announced or unusable", () => {
    expect(
      toIntervals([
        { days: [true], startTime: "00:00:00", endTime: "00:00:00" },
        { days: [true], startTime: null, endTime: "10:59:00" },
        { days: [true], startTime: "11:00:00", endTime: "10:00:00" },
      ])
    ).toEqual([]);
  });
});

describe("date ranges", () => {
  it("treats missing dates as the whole term", () => {
    const always = toDateRange({
      sectionId: "1",
      component: "LEC",
      meetings: [],
    });
    const fall = toDateRange({
      sectionId: "2",
      component: "LEC",
      meetings: [],
      startDate: "2026-08-26",
      endDate: "2026-12-11",
    });

    expect(rangesOverlap(always, fall)).toBe(true);
  });

  it("separates sections that run in different weeks", () => {
    const first = toDateRange({
      sectionId: "1",
      component: "LEC",
      meetings: [],
      startDate: "2026-08-26",
      endDate: "2026-10-16",
    });
    const second = toDateRange({
      sectionId: "2",
      component: "LEC",
      meetings: [],
      startDate: "2026-10-19",
      endDate: "2026-12-11",
    });

    expect(rangesOverlap(first, second)).toBe(false);
  });
});
