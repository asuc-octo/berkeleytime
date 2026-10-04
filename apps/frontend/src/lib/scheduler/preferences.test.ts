import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFERENCES,
  sanitizePreferences,
  toMondayFirst,
  toSundayFirst,
} from "./preferences";

describe("sanitizePreferences", () => {
  it("falls back to defaults for missing or malformed values", () => {
    expect(sanitizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(
      sanitizePreferences({
        earliestStart: "9",
        latestEnd: 2000,
        avoidDays: "Fri",
        fewerDays: 1,
      })
    ).toEqual(DEFAULT_PREFERENCES);
  });

  it("keeps valid values", () => {
    const valid = {
      earliestStart: 540,
      latestEnd: 1020,
      avoidDays: [false, false, false, false, true, false, false],
      fewerDays: true,
      fewerGaps: false,
      onlyOpenSections: true,
    };

    expect(sanitizePreferences(valid)).toEqual(valid);
  });
});

describe("day order", () => {
  it("converts between Monday-first and Sunday-first", () => {
    const mondayAndFriday = [true, false, false, false, true, false, false];

    expect(toSundayFirst(mondayAndFriday)).toEqual([
      false,
      true,
      false,
      false,
      false,
      true,
      false,
    ]);
    expect(toMondayFirst(toSundayFirst(mondayAndFriday))).toEqual(
      mondayAndFriday
    );
  });
});
