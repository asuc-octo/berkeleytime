import { describe, expect, it } from "vitest";

import type { IScheduleListSchedule } from "@/lib/api/schedules";

import {
  classConflictsWithMeetings,
  getScheduleMeetings,
  meetingsOverlap,
} from "./conflict";

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

  it("keeps a class whose meeting has no announced time", () => {
    const noAnnouncedTime = {
      days: mondayMorning.days,
      startTime: null,
      endTime: null,
    };

    expect(meetingsOverlap(noAnnouncedTime, mondayMorning)).toBe(false);
    expect(classConflictsWithMeetings([noAnnouncedTime], [mondayMorning])).toBe(
      false
    );
  });
});

const section = (sectionId: string, meetings: { days: boolean[] }[]) =>
  ({
    sectionId,
    number: sectionId,
    component: "LEC",
    meetings: meetings.map((meeting) => ({
      ...meeting,
      startTime: "09:00",
      endTime: "10:00",
    })),
  }) as never;

const scheduleClass = ({
  hidden,
  selectedSectionIds,
  sections,
}: {
  hidden: boolean;
  selectedSectionIds: string[];
  sections: { sectionId: string; meetings: { days: boolean[] }[] }[];
}) =>
  ({
    color: null,
    hidden,
    selectedSections: selectedSectionIds.map((sectionId) => ({ sectionId })),
    class: {
      subject: "COMPSCI",
      courseNumber: "61A",
      number: "001",
      primarySection: sections[0],
      sections: sections.slice(1),
    },
  }) as never;

const dayOnly = (index: number) =>
  Array.from({ length: 7 }, (_, position) => position === index);

const schedule = (
  classes: ReturnType<typeof scheduleClass>[],
  events: { hidden: boolean; days: boolean[] }[]
) =>
  ({
    _id: "schedule",
    name: "My schedule",
    year: 2026,
    semester: "Fall",
    sessionId: { year: 2026, semester: "Fall" },
    classes,
    events: events.map((event, index) => ({
      _id: `event-${index}`,
      title: `Event ${index}`,
      description: null,
      color: null,
      startTime: "09:00",
      endTime: "10:00",
      ...event,
    })),
  }) as unknown as NonNullable<IScheduleListSchedule>;

describe("collecting a schedule's meetings", () => {
  const monday = dayOnly(1);
  const tuesday = dayOnly(2);

  it("keeps only the shown classes, from their selected sections", () => {
    const meetings = getScheduleMeetings(
      schedule(
        [
          scheduleClass({
            hidden: false,
            selectedSectionIds: ["1"],
            sections: [
              section("1", [{ days: monday }]),
              section("2", [{ days: tuesday }]),
            ],
          }),
        ],
        []
      )
    );

    expect(meetings).toHaveLength(1);
    expect(meetings[0].days).toEqual(monday);
  });

  it("drops a hidden class and its sections", () => {
    const meetings = getScheduleMeetings(
      schedule(
        [
          scheduleClass({
            hidden: true,
            selectedSectionIds: ["1"],
            sections: [section("1", [{ days: monday }])],
          }),
        ],
        []
      )
    );

    expect(meetings).toEqual([]);
  });

  it("drops a hidden event and keeps a shown one", () => {
    const meetings = getScheduleMeetings(
      schedule(
        [],
        [
          { hidden: true, days: monday },
          { hidden: false, days: tuesday },
        ]
      )
    );

    expect(meetings).toHaveLength(1);
    expect(meetings[0].days).toEqual(tuesday);
  });
});
