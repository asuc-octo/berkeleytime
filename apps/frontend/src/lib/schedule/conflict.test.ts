import { describe, expect, it } from "vitest";

import { classConflictsWithMeetings, meetingsOverlap } from "./conflict";

const mondayMorning = {
  days: [false, true, false, false, false, false, false],
  startTime: "09:00",
  endTime: "10:00",
};

const mondayLateMorning = {
  days: [false, true, false, false, false, false, false],
  startTime: "09:30",
  endTime: "10:30",
};

const tuesdayMorning = {
  days: [false, false, true, false, false, false, false],
  startTime: "09:00",
  endTime: "10:00",
};

describe("class meetings versus a saved schedule", () => {
  it("keeps a class that has no meetings", () => {
    expect(classConflictsWithMeetings([], [mondayMorning])).toBe(false);
  });

  it("keeps every class when the schedule is empty", () => {
    expect(classConflictsWithMeetings([mondayMorning], [])).toBe(false);
  });

  it("keeps a class on a different day at the same hour", () => {
    expect(classConflictsWithMeetings([tuesdayMorning], [mondayMorning])).toBe(
      false
    );
  });

  it("hides a class that overlaps another on the same day", () => {
    expect(
      classConflictsWithMeetings([mondayLateMorning], [mondayMorning])
    ).toBe(true);
  });

  it("treats a shared start time as an overlap", () => {
    expect(classConflictsWithMeetings([mondayMorning], [mondayMorning])).toBe(
      true
    );
  });

  it("ignores meetings that only touch at the edges", () => {
    const endsWhenTheOtherStarts = {
      days: [false, true, false, false, false, false, false],
      startTime: "10:00",
      endTime: "11:00",
    };

    expect(meetingsOverlap(mondayMorning, endsWhenTheOtherStarts)).toBe(false);
    expect(
      classConflictsWithMeetings([endsWhenTheOtherStarts], [mondayMorning])
    ).toBe(false);
  });
});
