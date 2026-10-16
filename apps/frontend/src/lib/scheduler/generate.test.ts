import { describe, expect, it } from "vitest";

import {
  GeneratedSchedule,
  GeneratorClass,
  GeneratorEvent,
  GeneratorSection,
  generateSchedules,
} from "./generate";
import { DEFAULT_PREFERENCES, GeneratorPreferences } from "./preferences";

const MON = 0;
const TUE = 1;
const WED = 2;
const THU = 3;
const FRI = 4;

const time = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

let nextId = 10000;

const section = (
  component: string,
  days: number[],
  startHour: number,
  hours = 1,
  status: "O" | "C" = "O"
): GeneratorSection => ({
  sectionId: String(nextId++),
  component,
  meetings: [
    {
      days: [0, 1, 2, 3, 4, 5, 6].map((day) => days.includes(day)),
      // Berkeley lists a 10:10-11:00 class as 10:00-10:59
      startTime: time(startHour * 60),
      endTime: time(startHour * 60 + hours * 60 - 1),
    },
  ],
  enrollment: { latest: { status, enrolledCount: 10, maxEnroll: 30 } },
});

const scheduleClass = (
  primarySection: GeneratorSection,
  sections: GeneratorSection[],
  options: Partial<GeneratorClass> = {}
): GeneratorClass => ({
  class: { primarySection, sections },
  selectedSections: [],
  ...options,
});

const preferences = (
  overrides: Partial<GeneratorPreferences> = {}
): GeneratorPreferences => ({
  ...DEFAULT_PREFERENCES,
  fewerGaps: false,
  ...overrides,
});

const sectionsOf = (schedule: GeneratedSchedule<GeneratorClass>) =>
  schedule.classes.flatMap(({ scheduleClass, sectionIds }) =>
    sectionIds.map((id) => {
      const { primarySection, sections } = scheduleClass.class;
      const found = [primarySection, ...sections].find(
        (candidate) => candidate?.sectionId === id
      );
      if (!found) throw new Error(`Unknown section ${id}`);
      return found;
    })
  );

const intervalsOf = (sections: GeneratorSection[]) =>
  sections.flatMap((s) =>
    s.meetings.flatMap((meeting) =>
      (meeting.days ?? []).flatMap((meets, day) =>
        meets
          ? [
              {
                day,
                start:
                  Number(meeting.startTime!.slice(0, 2)) * 60 +
                  Number(meeting.startTime!.slice(3, 5)),
                end:
                  Number(meeting.endTime!.slice(0, 2)) * 60 +
                  Number(meeting.endTime!.slice(3, 5)),
              },
            ]
          : []
      )
    )
  );

const hasOverlap = (sections: GeneratorSection[]) => {
  const intervals = intervalsOf(sections);
  return intervals.some((a, i) =>
    intervals.some(
      (b, j) => i < j && a.day === b.day && a.start < b.end && b.start < a.end
    )
  );
};

const timesOf = (sections: GeneratorSection[]) =>
  intervalsOf(sections)
    .map(({ day, start, end }) => `${day}:${start}-${end}`)
    .sort()
    .join("|");

describe("generateSchedules", () => {
  it("finds schedules for a class past the old 500-combination limit", () => {
    const discussions = Array.from({ length: 25 }, (_, i) =>
      section("DIS", [i % 5], 8 + (i % 9))
    );
    const labs = Array.from({ length: 21 }, (_, i) =>
      section("LAB", [(i + 2) % 5], 9 + (i % 7), 2)
    );
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        ...discussions,
        ...labs,
      ]),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules.length).toBe(8);
    for (const schedule of schedules) {
      const chosen = sectionsOf(schedule);
      expect(chosen.map((s) => s.component).sort()).toEqual([
        "DIS",
        "LAB",
        "LEC",
      ]);
      expect(hasOverlap(chosen)).toBe(false);
    }
  });

  it("never returns schedules that differ only by sections meeting at the same time", () => {
    const sameTimeA = section("DIS", [TUE], 9);
    const sameTimeB = section("DIS", [TUE], 9);
    const otherTime = section("DIS", [THU], 9);
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        sameTimeA,
        sameTimeB,
        otherTime,
      ]),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules).toHaveLength(2);
    const times = schedules.map((s) => timesOf(sectionsOf(s)));
    expect(new Set(times).size).toBe(2);
  });

  it("treats events as hard constraints", () => {
    const tuesday = section("DIS", [TUE], 9);
    const thursday = section("DIS", [THU], 9);
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [tuesday, thursday]),
    ];
    const events: GeneratorEvent[] = [
      {
        days: [false, true, false, false, false, false, false],
        startTime: "08:00",
        endTime: "12:00",
      },
    ];

    const { schedules } = generateSchedules(classes, events, preferences());

    expect(schedules).toHaveLength(1);
    expect(schedules[0].classes[0].sectionIds).toContain(thursday.sectionId);
  });

  it("keeps locked classes and components and skips excluded sections", () => {
    const lecture = section("LEC", [MON, WED, FRI], 10);
    const [first, second, third] = [TUE, WED, THU].map((day) =>
      section("DIS", [day], 14)
    );

    const lockedClass = scheduleClass(lecture, [first, second, third], {
      locked: true,
      selectedSections: [
        { sectionId: lecture.sectionId },
        { sectionId: second.sectionId },
      ],
    });
    const mondayDiscussion = section("DIS", [MON], 15);
    const fridayDiscussion = section("DIS", [FRI], 15);
    const lockedComponent = scheduleClass(
      section("LEC", [TUE, THU], 11),
      [mondayDiscussion, fridayDiscussion],
      {
        lockedComponents: ["DIS"],
        selectedSections: [{ sectionId: fridayDiscussion.sectionId }],
      }
    );
    const blockedLab = section("LAB", [MON], 16);
    const openLab = section("LAB", [FRI], 16);
    const withBlock = scheduleClass(
      section("LEC", [TUE, THU], 9),
      [blockedLab, openLab],
      { blockedSections: [blockedLab.sectionId] }
    );

    const classes = [lockedClass, lockedComponent, withBlock];
    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules.length).toBeGreaterThan(0);
    for (const schedule of schedules) {
      expect([...schedule.classes[0].sectionIds].sort()).toEqual(
        [lecture.sectionId, second.sectionId].sort()
      );
      expect(schedule.classes[1].sectionIds).toContain(
        fridayDiscussion.sectionId
      );
      expect(schedule.classes[2].sectionIds).not.toContain(
        blockedLab.sectionId
      );
    }
  });

  it("leaves a component out when every section of it is excluded", () => {
    const lab = section("LAB", [MON], 16);
    const discussion = section("DIS", [TUE], 9);
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [discussion, lab], {
        blockedSections: [lab.sectionId],
      }),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules).toHaveLength(1);
    expect(sectionsOf(schedules[0]).map((s) => s.component)).toEqual([
      "LEC",
      "DIS",
    ]);
  });

  it("ranks by the preferred hours and avoided days", () => {
    const early = section("DIS", [MON], 8);
    const friday = section("DIS", [FRI], 13);
    const wednesday = section("DIS", [WED], 15);
    const classes = [
      scheduleClass(section("LEC", [TUE, THU], 11), [early, friday, wednesday]),
    ];

    const avoidFriday = generateSchedules(
      classes,
      [],
      preferences({
        earliestStart: 10 * 60,
        avoidDays: [false, false, false, false, true, false, false],
      })
    );

    expect(avoidFriday.schedules[0].classes[0].sectionIds).toContain(
      wednesday.sectionId
    );
    expect(avoidFriday.schedules.at(-1)?.classes[0].sectionIds).toContain(
      friday.sectionId
    );
  });

  it("does not schedule around times that are not announced yet", () => {
    const tba: GeneratorSection = {
      ...section("DIS", [], 0),
      meetings: [{ days: [], startTime: "00:00:00", endTime: "00:00:00" }],
    };
    const classes = [scheduleClass(section("LEC", [MON], 10), [tba])];

    const { schedules } = generateSchedules(
      classes,
      [],
      preferences({ earliestStart: 9 * 60 })
    );

    expect(schedules).toHaveLength(1);
    expect(schedules[0].cost).toBe(0);
  });

  it("explains why nothing fits", () => {
    const overlapping = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
    ];
    expect(generateSchedules(overlapping, [], preferences()).reasons).toEqual([
      { kind: "pair", classIndexes: [0, 1] },
    ]);

    const allClosed = [
      scheduleClass(section("LEC", [MON], 10), [
        section("DIS", [TUE], 9, 1, "C"),
        section("DIS", [THU], 9, 1, "C"),
      ]),
    ];
    expect(
      generateSchedules(allClosed, [], preferences({ onlyOpenSections: true }))
        .reasons
    ).toEqual([{ kind: "closed", classIndex: 0, component: "DIS" }]);
  });

  it("finds the true best schedule on random inputs", () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const pick = (max: number) => Math.floor(random() * max);

    for (let run = 0; run < 40; run++) {
      const classes = Array.from({ length: 3 }, () =>
        scheduleClass(
          section(
            "LEC",
            [
              [MON, WED, FRI],
              [TUE, THU],
            ][pick(2)],
            8 + pick(9)
          ),
          [
            ...Array.from({ length: 2 + pick(5) }, () =>
              section("DIS", [pick(5)], 8 + pick(10))
            ),
            ...Array.from({ length: pick(4) }, () =>
              section("LAB", [pick(5)], 8 + pick(9), 2)
            ),
          ]
        )
      );

      // Brute force over every combination of one section per component.
      const options = classes.flatMap(
        ({ class: { primarySection, sections } }) => {
          const byComponent = new Map<string, GeneratorSection[]>();
          for (const s of [primarySection!, ...sections])
            byComponent.set(s.component, [
              ...(byComponent.get(s.component) ?? []),
              s,
            ]);
          return [...byComponent.values()];
        }
      );
      const valid: GeneratorSection[][] = [];
      const walk = (index: number, chosen: GeneratorSection[]) => {
        if (hasOverlap(chosen)) return;
        if (index === options.length) {
          valid.push(chosen);
          return;
        }
        for (const option of options[index])
          walk(index + 1, [...chosen, option]);
      };
      walk(0, []);

      const earlyMinutes = (chosen: GeneratorSection[]) =>
        intervalsOf(chosen).reduce(
          (sum, { start }) => sum + Math.max(0, 10 * 60 - start),
          0
        );
      const days = (chosen: GeneratorSection[]) =>
        new Set(intervalsOf(chosen).map(({ day }) => day)).size;

      const byStart = generateSchedules(
        classes,
        [],
        preferences({ earliestStart: 10 * 60 })
      );
      const byDays = generateSchedules(
        classes,
        [],
        preferences({ fewerDays: true })
      );

      if (valid.length === 0) {
        expect(byStart.schedules).toHaveLength(0);
        expect(byStart.reasons.length).toBeGreaterThan(0);
        continue;
      }

      expect(earlyMinutes(sectionsOf(byStart.schedules[0]))).toBe(
        Math.min(...valid.map(earlyMinutes))
      );
      expect(days(sectionsOf(byDays.schedules[0]))).toBe(
        Math.min(...valid.map(days))
      );

      const distinct = new Set(
        byStart.schedules.map((s) => timesOf(sectionsOf(s)))
      );
      expect(distinct.size).toBe(byStart.schedules.length);
      for (const schedule of [...byStart.schedules, ...byDays.schedules])
        expect(hasOverlap(sectionsOf(schedule))).toBe(false);
    }
  });
});
