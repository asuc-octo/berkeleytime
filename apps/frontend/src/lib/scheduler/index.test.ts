import { describe, expect, it } from "vitest";

import {
  FRI,
  MON,
  THU,
  TUE,
  WED,
  adversarialClasses,
  hasOverlap,
  intervalsOf,
  preferences,
  realisticClasses,
  scheduleClass,
  section,
  sectionsOf,
  seededRandom,
  timesOf,
} from "./fixtures";
import {
  GeneratedSchedule,
  GeneratorClass,
  GeneratorEvent,
  GeneratorSection,
  generateSchedules,
} from "./index";
import { SORT_KEYS, SortKey } from "./preferences";

const idsOf = (schedule: GeneratedSchedule, classIndex: number) =>
  schedule.classes[classIndex].sectionIds;

// Equal for schedules that put the same components at the same times.
const keyOf = (chosen: GeneratorSection[]) =>
  chosen.map((s, i) => `${i}:${timesOf([s])}`).join("|");

describe("generateSchedules", () => {
  it("finds schedules for a class past the old 500-combination limit", () => {
    const discussions = Array.from({ length: 25 }, (_, i) =>
      section("DIS", [i % 5], 8 + (i % 9))
    );
    const labs = Array.from({ length: 21 }, (_, i) =>
      section("LAB", [(i + 2) % 5], 9 + (i % 7), { hours: 2 })
    );
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        ...discussions,
        ...labs,
      ]),
    ];

    const result = generateSchedules(classes, [], preferences());

    expect(result.truncated).toBe(false);
    expect(result.total).toBeGreaterThan(8);
    expect(result.schedules).toHaveLength(8);
    for (const schedule of result.schedules) {
      const chosen = sectionsOf(classes, schedule);
      expect(chosen.map((s) => s.component).sort()).toEqual([
        "DIS",
        "LAB",
        "LEC",
      ]);
      expect(hasOverlap(chosen)).toBe(false);
    }
  });

  it("counts sections that meet at the same time as one option", () => {
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        section("DIS", [TUE], 9),
        section("DIS", [TUE], 9),
        section("DIS", [THU], 9),
      ]),
    ];

    const result = generateSchedules(classes, [], preferences());

    expect(result.total).toBe(2);
    const times = result.schedules.map((s) => timesOf(sectionsOf(classes, s)));
    expect(new Set(times).size).toBe(2);
  });

  it("never overlaps busy times", () => {
    const thursday = section("DIS", [THU], 9);
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        section("DIS", [TUE], 9),
        thursday,
      ]),
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
    expect(idsOf(schedules[0], 0)).toContain(thursday.sectionId);
  });

  it("keeps locked classes and components and skips excluded sections", () => {
    const lecture = section("LEC", [MON, WED, FRI], 10);
    const [first, second, third] = [TUE, WED, THU].map((day) =>
      section("DIS", [day], 14)
    );
    const fridayDiscussion = section("DIS", [FRI], 15);
    const blockedLab = section("LAB", [MON], 16);

    const classes = [
      scheduleClass(lecture, [first, second, third], {
        locked: true,
        selectedSections: [
          { sectionId: lecture.sectionId },
          { sectionId: second.sectionId },
        ],
      }),
      scheduleClass(
        section("LEC", [TUE, THU], 11),
        [section("DIS", [MON], 15), fridayDiscussion],
        {
          lockedComponents: ["DIS"],
          selectedSections: [{ sectionId: fridayDiscussion.sectionId }],
        }
      ),
      scheduleClass(
        section("LEC", [TUE, THU], 9),
        [blockedLab, section("LAB", [FRI], 16)],
        { blockedSections: [blockedLab.sectionId] }
      ),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules.length).toBeGreaterThan(0);
    for (const schedule of schedules) {
      expect([...idsOf(schedule, 0)].sort()).toEqual(
        [lecture.sectionId, second.sectionId].sort()
      );
      expect(idsOf(schedule, 1)).toContain(fridayDiscussion.sectionId);
      expect(idsOf(schedule, 2)).not.toContain(blockedLab.sectionId);
    }
  });

  it("leaves a component out when every section of it is excluded", () => {
    const lab = section("LAB", [MON], 16);
    const classes = [
      scheduleClass(
        section("LEC", [MON, WED, FRI], 10),
        [section("DIS", [TUE], 9), lab],
        { blockedSections: [lab.sectionId] }
      ),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules).toHaveLength(1);
    expect(sectionsOf(classes, schedules[0]).map((s) => s.component)).toEqual([
      "LEC",
      "DIS",
    ]);
  });

  it("enforces the rules but never removes locked sections", () => {
    const early = section("DIS", [MON], 8);
    const friday = section("DIS", [FRI], 13);
    const late = section("DIS", [WED], 18);
    const closed = section("DIS", [TUE], 13, { status: "C" });
    const good = section("DIS", [THU], 13);
    const lockedEarly = section("LAB", [TUE], 8);
    const classes = [
      scheduleClass(section("LEC", [TUE, THU], 11), [
        early,
        friday,
        late,
        closed,
        good,
      ]),
      scheduleClass(section("LEC", [MON, WED], 14), [lockedEarly], {
        lockedComponents: ["LAB"],
        selectedSections: [{ sectionId: lockedEarly.sectionId }],
      }),
    ];

    const { schedules } = generateSchedules(
      classes,
      [],
      preferences({
        earliestStart: 10 * 60,
        latestEnd: 17 * 60,
        avoidDays: [false, false, false, false, true, false, false],
        onlyOpenSections: true,
      })
    );

    expect(schedules).toHaveLength(1);
    expect(idsOf(schedules[0], 0)).toContain(good.sectionId);
    expect(idsOf(schedules[0], 1)).toContain(lockedEarly.sectionId);
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
  });

  it("lets sections in different weeks share a time", () => {
    const firstHalf = section("LEC", [MON, WED, FRI], 10, {
      startDate: "2026-08-26",
      endDate: "2026-10-16",
    });
    const secondHalf = section("LEC", [MON, WED, FRI], 10, {
      startDate: "2026-10-19",
      endDate: "2026-12-11",
    });

    const { schedules } = generateSchedules(
      [scheduleClass(firstHalf, []), scheduleClass(secondHalf, [])],
      [],
      preferences()
    );

    expect(schedules).toHaveLength(1);
  });

  it("does not count Berkeley passing time as a gap", () => {
    const classes = [
      scheduleClass(section("LEC", [MON], 10), []),
      scheduleClass(section("LEC", [MON], 11), []),
      scheduleClass(section("LEC", [MON], 14), []),
    ];

    const [schedule] = generateSchedules(classes, [], preferences()).schedules;

    // 10:00-10:59 and 11:00-11:59 touch; 12:00-14:00 is a real gap.
    expect(schedule.gapMinutes).toBe(120);
  });

  it("skips near-copies so results differ in at least two choices", () => {
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 13), [
        ...[MON, TUE, WED, THU].map((day) => section("DIS", [day], 9)),
        ...[MON, TUE, WED, THU].map((day) =>
          section("LAB", [day], 15, { hours: 2 })
        ),
      ]),
    ];

    const { schedules } = generateSchedules(classes, [], preferences(), {
      count: 4,
    });

    const [discussion, lab] = [1, 2];
    for (let a = 0; a < schedules.length; a++)
      for (let b = a + 1; b < schedules.length; b++) {
        const differ = [discussion, lab].filter(
          (index) =>
            idsOf(schedules[a], 0)[index] !== idsOf(schedules[b], 0)[index]
        ).length;
        expect(differ).toBe(2);
      }
  });

  it("explains why nothing fits and which rule to turn off", () => {
    const overlapping = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
    ];
    expect(generateSchedules(overlapping, [], preferences()).reasons).toEqual([
      { kind: "pair", classIndexes: [0, 1] },
    ]);

    const fridayOnly = [
      scheduleClass(section("LEC", [TUE, THU], 10), [
        section("DIS", [FRI], 9),
        section("DIS", [FRI], 12),
      ]),
    ];
    const noFridays = generateSchedules(
      fridayOnly,
      [],
      preferences({
        avoidDays: [false, false, false, false, true, false, false],
      })
    );
    expect(noFridays.reasons).toEqual([
      { kind: "days", classIndex: 0, component: "DIS" },
    ]);
    expect(noFridays.relaxations).toEqual([{ rule: "avoidDays", count: 2 }]);

    const allClosed = [
      scheduleClass(section("LEC", [MON], 10), [
        section("DIS", [TUE], 9, { status: "C" }),
        section("DIS", [THU], 9, { status: "C" }),
      ]),
    ];
    const openOnly = generateSchedules(
      allClosed,
      [],
      preferences({ onlyOpenSections: true })
    );
    expect(openOnly.reasons).toEqual([
      { kind: "closed", classIndex: 0, component: "DIS" },
    ]);
    expect(openOnly.relaxations).toEqual([
      { rule: "onlyOpenSections", count: 2 },
    ]);
  });

  it("stops at the cap and says so", () => {
    const classes = adversarialClasses();

    const result = generateSchedules(classes, [], preferences(), {
      cap: 1_000,
    });

    expect(result.truncated).toBe(true);
    expect(result.total).toBe(1_000);
    expect(result.schedules).toHaveLength(8);
    for (const schedule of result.schedules)
      expect(hasOverlap(sectionsOf(classes, schedule))).toBe(false);
  });

  it("stops early when no schedule exists but the search is huge", () => {
    // Every time of the fifth class's lab overlaps one of the four lectures,
    // so each of the many partial schedules of the others is a dead end.
    const labs = [
      ...[MON, WED, FRI].flatMap((day) => [
        ...[8.5, 9, 9.5, 12.5, 13, 13.5].map((hour) =>
          section("LAB", [day], hour)
        ),
        ...[8, 12].map((hour) => section("LAB", [day], hour, { hours: 2 })),
      ]),
      ...[TUE, THU].flatMap((day) =>
        [10.5, 11, 11.5, 14.5, 15, 15.5].map((hour) =>
          section("LAB", [day], hour)
        )
      ),
    ];
    const classes = [
      ...adversarialClasses(),
      scheduleClass(section("LEC", [TUE, THU], 19), labs),
    ];

    const result = generateSchedules(classes, [], preferences());

    expect(result.total).toBe(0);
    expect(result.truncated).toBe(true);
    expect(result.reasons).toEqual([{ kind: "all" }]);
    expect(result.elapsedMs).toBeLessThan(2_000);
  });

  it("handles the realistic case quickly", () => {
    const result = generateSchedules(realisticClasses(), [], preferences());

    expect(result.schedules).toHaveLength(8);
    expect(result.elapsedMs).toBeLessThan(1_000);
  });

  it("matches brute force on random inputs, rules and sort keys", () => {
    const random = seededRandom(7);
    const pick = (max: number) => Math.floor(random() * max);

    // Independent re-implementation of the Berkeley-time rounding and gaps.
    const rounded = (chosen: GeneratorSection[]) =>
      intervalsOf(chosen).map((i) => ({
        ...i,
        end: i.end % 10 === 9 ? i.end + 1 : i.end,
      }));
    const gaps = (chosen: GeneratorSection[]) => {
      let total = 0;
      for (let day = 0; day < 7; day++) {
        const today = rounded(chosen)
          .filter((i) => i.day === day)
          .sort((a, b) => a.start - b.start);
        for (let i = 1; i < today.length; i++) {
          const gap = today[i].start - today[i - 1].end;
          if (gap > 10) total += gap;
        }
      }
      return total;
    };
    const sortValue: Record<SortKey, (chosen: GeneratorSection[]) => number> = {
      "fewest-gaps": gaps,
      "fewest-days": (chosen) =>
        new Set(intervalsOf(chosen).map(({ day }) => day)).size,
      "latest-start": (chosen) =>
        -Math.min(...intervalsOf(chosen).map(({ start }) => start)),
      "earliest-finish": (chosen) =>
        Math.max(...rounded(chosen).map(({ end }) => end)),
    };

    for (let run = 0; run < 60; run++) {
      const classes: GeneratorClass[] = Array.from({ length: 3 }, () =>
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
              section("LAB", [pick(5)], 8 + pick(9), { hours: 2 })
            ),
          ]
        )
      );
      const earliestStart = [null, 9 * 60, 10 * 60][pick(3)];
      const avoided = pick(7); // 5 and 6 mean no avoided day
      const avoidDays = [0, 1, 2, 3, 4, 5, 6].map(
        (day) => day === avoided && day < 5
      );
      const sortBy = SORT_KEYS[run % SORT_KEYS.length];

      // Every combination of one allowed section per component, without overlaps.
      const allowed = (s: GeneratorSection) =>
        intervalsOf([s]).every(
          ({ day, start }) =>
            (earliestStart === null || start >= earliestStart) &&
            !avoidDays[day]
        );
      const groups = classes.flatMap(
        ({ class: { primarySection, sections } }) => {
          const byComponent = new Map<string, GeneratorSection[]>();
          for (const s of [primarySection!, ...sections])
            byComponent.set(s.component, [
              ...(byComponent.get(s.component) ?? []),
              s,
            ]);
          return [...byComponent.values()].map((group) =>
            group.filter(allowed)
          );
        }
      );
      const valid: GeneratorSection[][] = [];
      const walk = (index: number, chosen: GeneratorSection[]) => {
        if (hasOverlap(chosen)) return;
        if (index === groups.length) return void valid.push(chosen);
        for (const option of groups[index])
          walk(index + 1, [...chosen, option]);
      };
      walk(0, []);
      const distinctValid = new Set(valid.map(keyOf)).size;

      const result = generateSchedules(
        classes,
        [],
        preferences({ earliestStart, avoidDays, sortBy })
      );

      expect(result.total).toBe(distinctValid);
      if (distinctValid === 0) {
        expect(result.schedules).toHaveLength(0);
        expect(result.reasons.length).toBeGreaterThan(0);
        continue;
      }

      const best = Math.min(...valid.map(sortValue[sortBy]));
      expect(sortValue[sortBy](sectionsOf(classes, result.schedules[0]))).toBe(
        best
      );

      const times = result.schedules.map((s) => keyOf(sectionsOf(classes, s)));
      expect(new Set(times).size).toBe(result.schedules.length);
      for (const schedule of result.schedules) {
        const chosen = sectionsOf(classes, schedule);
        expect(hasOverlap(chosen)).toBe(false);
        expect(chosen.every(allowed)).toBe(true);
      }
    }
  });
});
