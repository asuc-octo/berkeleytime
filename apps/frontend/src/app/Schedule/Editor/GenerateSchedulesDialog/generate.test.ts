import { describe, expect, it } from "vitest";

import { IScheduleClass, IScheduleEvent } from "@/lib/api/schedules";

import { MAX_GENERATED_SCHEDULES, generateSchedules } from "./generate";

// Days are indexed from Sunday, e.g. "MW" => [false, true, false, true, ...]
const days = (pattern: string) =>
  ["U", "M", "T", "W", "R", "F", "S"].map((day) => pattern.includes(day));

const section = (
  sectionId: string,
  component: string,
  pattern?: string,
  startTime?: string,
  endTime?: string
) => ({
  sectionId,
  component,
  number: sectionId,
  // Unannounced sections come through with no days and no times
  meetings: [{ days: days(pattern ?? ""), startTime, endTime }],
});

const scheduleClass = (
  courseNumber: string,
  primarySection: ReturnType<typeof section>,
  sections: ReturnType<typeof section>[],
  overrides: Record<string, unknown> = {}
) =>
  ({
    class: {
      subject: "TEST",
      courseNumber,
      number: "001",
      primarySection,
      sections,
    },
    selectedSections: [{ sectionId: primarySection.sectionId }],
    hidden: false,
    locked: false,
    blockedSections: [],
    lockedComponents: [],
    ...overrides,
  }) as unknown as IScheduleClass;

const event = (
  title: string,
  pattern: string,
  startTime: string,
  endTime: string
) =>
  ({
    title,
    days: days(pattern),
    startTime,
    endTime,
  }) as unknown as IScheduleEvent;

describe("generateSchedules", () => {
  it("only returns combinations without time conflicts", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      [
        section("a-dis-1", "DIS", "T", "09:00", "10:00"),
        section("a-dis-2", "DIS", "T", "13:00", "14:00"),
      ]
    );
    const b = scheduleClass(
      "B",
      section("b-lec", "LEC", "T", "09:00", "10:00"),
      [
        section("b-lab-1", "LAB", "MW", "10:30", "11:30"),
        section("b-lab-2", "LAB", "F", "10:00", "12:00"),
      ]
    );

    const { schedules, conflicts } = generateSchedules([a, b], []);

    expect(schedules).toEqual([
      [
        ["a-lec", "a-dis-2"],
        ["b-lec", "b-lab-2"],
      ],
    ]);
    expect(conflicts).toEqual([]);
  });

  it("generates schedules when section times are not posted yet", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      Array.from({ length: 30 }, (_, i) => section(`a-dis-${i}`, "DIS"))
    );
    const b = scheduleClass(
      "B",
      section("b-lec", "LEC", "TR", "10:00", "11:00"),
      Array.from({ length: 30 }, (_, i) => section(`b-dis-${i}`, "DIS")),
      { selectedSections: [{ sectionId: "b-lec" }, { sectionId: "b-dis-7" }] }
    );

    const { schedules, unscheduled, truncated } = generateSchedules([a, b], []);

    // Unannounced sections are interchangeable: nothing is picked arbitrarily
    // and an existing selection is kept
    expect(schedules).toEqual([[["a-lec"], ["b-lec", "b-dis-7"]]]);
    expect(unscheduled).toEqual(["TEST A DIS", "TEST B DIS"]);
    expect(truncated).toBe(false);
  });

  it("collapses sections that meet at the same time", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      [
        section("a-lab-1", "LAB", "T", "09:00", "10:00"),
        section("a-lab-2", "LAB", "T", "09:00", "10:00"),
        section("a-lab-3", "LAB", "R", "09:00", "10:00"),
      ]
    );

    expect(generateSchedules([a], []).schedules).toEqual([
      [["a-lec", "a-lab-1"]],
      [["a-lec", "a-lab-3"]],
    ]);
  });

  it("names the classes whose fixed sections overlap", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      []
    );
    const b = scheduleClass(
      "B",
      section("b-lec", "LEC", "W", "10:30", "12:00"),
      []
    );

    const { schedules, conflicts } = generateSchedules([a, b], []);

    expect(schedules).toEqual([]);
    expect(conflicts).toEqual(["TEST A LEC a-lec overlaps TEST B LEC b-lec."]);
  });

  it("names the component whose every section is blocked", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      [
        section("a-dis-1", "DIS", "T", "09:00", "10:00"),
        section("a-dis-2", "DIS", "R", "09:00", "10:00"),
      ]
    );

    const { schedules, conflicts } = generateSchedules(
      [a],
      [event("Work", "TR", "08:00", "12:00")]
    );

    expect(schedules).toEqual([]);
    expect(conflicts).toEqual(["Every TEST A DIS section overlaps Work."]);
  });

  it("respects locked classes, locked components and blocked sections", () => {
    const sections = [
      section("dis-1", "DIS", "T", "09:00", "10:00"),
      section("dis-2", "DIS", "R", "09:00", "10:00"),
      section("dis-3", "DIS", "F", "09:00", "10:00"),
    ];
    const lecture = section("lec", "LEC", "MW", "10:00", "11:00");
    const selectedSections = [{ sectionId: "lec" }, { sectionId: "dis-2" }];

    expect(
      generateSchedules(
        [
          scheduleClass("A", lecture, sections, {
            locked: true,
            selectedSections,
          }),
        ],
        []
      ).schedules
    ).toEqual([[["lec", "dis-2"]]]);

    expect(
      generateSchedules(
        [
          scheduleClass("A", lecture, sections, {
            lockedComponents: ["DIS"],
            selectedSections,
          }),
        ],
        []
      ).schedules
    ).toEqual([[["lec", "dis-2"]]]);

    expect(
      generateSchedules(
        [scheduleClass("A", lecture, sections, { blockedSections: ["dis-1"] })],
        []
      ).schedules
    ).toEqual([[["lec", "dis-2"]], [["lec", "dis-3"]]]);
  });

  it("ignores placeholder sections when real ones exist", () => {
    const a = scheduleClass(
      "A",
      section("a-lec", "LEC", "MW", "10:00", "11:00"),
      [
        section("a-dis-1", "DIS", "T", "09:00", "10:00"),
        section("a-dis-2", "DIS", "R", "09:00", "10:00"),
        // Catch-all sections everyone is enrolled in
        section("a-dis-999", "DIS"),
        section("a-lab-1", "LAB", "F", "09:00", "10:00"),
        section("a-lab-999", "LAB", "S", "00:02:00", "00:03:00"),
      ]
    );

    const { schedules, unscheduled } = generateSchedules([a], []);

    expect(schedules).toEqual([
      [["a-lec", "a-dis-1", "a-lab-1"]],
      [["a-lec", "a-dis-2", "a-lab-1"]],
    ]);
    expect(unscheduled).toEqual([]);
  });

  it("caps the number of schedules instead of refusing to generate", () => {
    const slots = Array.from({ length: 30 }, (_, i) =>
      section(
        `dis-${i}`,
        "DIS",
        "T",
        `${String(i % 24).padStart(2, "0")}:00`,
        `${String(i % 24).padStart(2, "0")}:30`
      )
    ).slice(0, 20);
    const classes = ["A", "B", "C"].map((name, i) =>
      scheduleClass(
        name,
        section(`${name}-lec`, "LEC", "M", `${10 + i}:00`, `${10 + i}:50`),
        slots.map((s) => ({ ...s, sectionId: `${name}-${s.sectionId}` }))
      )
    );

    const { schedules, truncated } = generateSchedules(classes, []);

    expect(schedules).toHaveLength(MAX_GENERATED_SCHEDULES);
    expect(truncated).toBe(true);
  });
});
